# T6: Audio engine, audio tracks, and waveforms

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T6.

## Goal
Real audio in the editor: import audio files, place them on audio tracks, hear them sample-accurately in sync with video, route video clip audio through the same engine, show waveforms on clips, and expose an analyser for the Phase 4 beat-reactive effects.

## Scope
IN: Web Audio engine, audio import and decode, audio clip scheduling, audio-based master clock, waveform extraction and rendering, volume and mute, master meter, `AnalyserNode` exposure.
OUT: audio effects, fades, beat detection logic (T14), export mixing (T21).

## Dependencies
None new. Use the Web Audio API. Read the current MDN docs for `AudioContext`, `AudioBufferSourceNode`, `decodeAudioData` and `MediaElementAudioSourceNode` before coding; do not guess.

## Requirements

### 1. Types
Extend `Clip` and `Track` (Zod + inferred types, update `emptyTimeline` defaults): `Clip.volume: number` (0 to 2, default 1). `Track.volume: number` (default 1). Add a migration-safe default so older JSON still parses.

### 2. Import audio
- Extend `mediaImport.ts`: `importAudio(file)` (accept `audio/*`, plus audio-only handling), reads duration with an `<audio>` metadata probe. Media panel accepts both video and audio; tabs or filter chips: All / Video / Audio. Show a mini waveform thumbnail (from T6 peaks) on audio assets.
- Video files also carry audio: when a video asset is imported, mark `hasAudio` (detect by decoding; if decode fails, treat as no audio). Add `hasAudio?: boolean` to `Asset`.

### 3. Audio engine: `lib/audioEngine.ts`
```ts
class AudioEngine {
  ctx: AudioContext;                       // created lazily on first user gesture
  masterGain: GainNode; analyser: AnalyserNode; // masterGain -> analyser -> destination
  loadAsset(asset: Asset): Promise<AudioBuffer | null>;   // fetch(objectUrl) -> arrayBuffer -> decodeAudioData, cached by asset id
  schedule(timeline: Timeline, fromTime: number): void;   // stops previous nodes, creates one BufferSource per active/upcoming clip
  stop(): void;
  setMasterVolume(v: number): void;
  getAnalyser(): AnalyserNode;
  dispose(): void;
}
```
- **Which clips make sound**: clips on audio tracks, AND clips on video tracks whose asset `hasAudio`. Respect `track.muted`, `clip.volume`, `track.volume` (per-clip `GainNode`).
- `schedule(timeline, fromTime)`: for every audible clip with `end > fromTime`: create `AudioBufferSourceNode`, connect through its gain to `masterGain`. Compute `when = ctx.currentTime + max(0, clip.start - fromTime)`, `offset = clip.sourceIn + max(0, fromTime - clip.start)`, `duration = clip.end - max(clip.start, fromTime)`. Call `source.start(when, offset, duration)`. Track created nodes so `stop()` can stop and disconnect all of them.
- Scheduling runs on play and on seek-while-playing. For edits during playback, re-schedule from the current time (debounce 50ms) so trims, splits and moves are audible immediately.
- Handle decode failures gracefully (mark asset `hasAudio=false`, show a small warning chip in the media panel).
- Memory: decoded buffers are large. Cap the cache (LRU of 8 buffers or ~300 MB estimated by `length * channels * 4`); evict assets not used in the timeline first.

### 4. Audio master clock
Create `AudioClock implements Clock` (interface from T5): `start(from)` records `anchorCtx = ctx.currentTime` and `anchorTime = from`; `now() = anchorTime + (ctx.currentTime - anchorCtx)`. Inject it with `controller.setClock(...)` on first play so the audio is the master and video follows. If the timeline has no audible clips, fall back to `PerformanceClock` (still resume the context so analysis works).
- `play()` flow: `await ctx.resume()` (user gesture), `engine.schedule(timeline, t)`, `clock.start(t)`, start the rAF loop. `pause()`/`seek()` call `engine.stop()` and reschedule if playing.
- Mute the `HTMLVideoElement`s in the renderer (`VIDEO_ELEMENT_AUDIO = false`) so there is no double audio. Remove the T5 TODO.
- Handle `ctx.state === "suspended"` and `statechange` events (show a toast "Click to enable audio" if blocked).

### 5. Waveform: `lib/waveform.ts`
```ts
computePeaks(buffer: AudioBuffer, peaksPerSecond = 100): Float32Array   // interleaved [min,max,...] mono-mixed, normalized to -1..1
getPeaks(assetId: string): Float32Array | undefined                    // cache
```
- Compute in chunks with `await` yields (`scheduler.yield` fallback to `setTimeout 0`) so the UI never blocks for large files; or move it into a Web Worker (`new Worker(new URL("./waveform.worker.ts", import.meta.url), { type: "module" })`). Prefer the worker; fall back to the main thread if it fails.
- Cache per asset in memory. Expose a small store `waveformStore` (Zustand) `{ peaks: Record<assetId, Float32Array>, status }` so clips re-render when ready. Store only plain typed arrays.

### 6. Waveform rendering in `ClipBlock`
- Draw on a `<canvas>` inside the clip block, only the **visible slice**: from `sourceIn` to `sourceIn + (end - start)`. Width in CSS px times `devicePixelRatio`. Redraw only when peaks, width, trim offsets or volume change (not on playback ticks, not on every scroll).
- Style: mirrored bars in the track color at 70% opacity; a thin center line; a dashed volume line overlay is optional.
- For video clips with audio show a short waveform strip (bottom 40%) under the label.
- Clips wider than 4000px: render only the part visible in the viewport (clip the canvas to the visible range using the scroll offset) to avoid giant canvases.

### 7. Volume and mute UI
- Inspector (right panel, minimal for now): when one clip is selected show a Volume slider 0 to 200% bound to `clip.volume` using a transaction (one undo step per drag). Track header gets a volume knob/slider and the mute toggle from T3.
- Top bar: master volume slider + a small level meter driven by the analyser (`getByteTimeDomainData` peak, drawn on a tiny canvas at 30fps only while playing, `transform: scaleX` for the bar, no layout).

### 8. Analyser access for Phase 4
Add `audioEngine.getAnalyser()` and a small helper `lib/audioAnalysis.ts` with a typed `getBands(): { bass: number; mid: number; high: number; level: number }` that reads FFT data (fftSize 2048, smoothing 0.8, bands: bass 20-250 Hz, mid 250-4000 Hz, high 4000-16000 Hz, each normalized 0..1). Include a dev-overlay readout in the T5 debug overlay. This is the hook T14 will use.

## Edge cases
- Importing a 50 MB WAV or a 10 minute MP3: UI stays responsive; waveform appears progressively (spinner chip while computing).
- Same asset used in many clips: decode once.
- Seeking while playing, rapid toggling, and edit-while-playing never leave orphaned audible nodes (assert `activeNodes.size === 0` after `stop()` in dev).
- Clip volume above 1: no clipping distortion beyond expected; apply a master `DynamicsCompressorNode` ONLY if clipping is audible in testing and document it.
- Tab hidden and shown: context state restored, clock re-anchored.
- iOS/Safari quirks: `webkitAudioContext` fallback, `decodeAudioData` promise form may differ (use a wrapper).

## Acceptance checklist
- [ ] Typecheck passes, no console errors, no unhandled promise rejections.
- [ ] Import `samples/test-beat.wav`, drag onto an audio track, press play: kick plays every 0.5s, in sync with the playhead.
- [ ] Video clips with audio play their tone through the engine (video elements are muted).
- [ ] Audio stays within 40ms of video during a 60s loop (use the debug overlay drift reading).
- [ ] Trimming, moving and splitting an audio clip while playing is audible on the next scheduling pass; no overlapping duplicate sound.
- [ ] Mute track silences it; volume slider changes loudness; one undo step per slider drag.
- [ ] Waveforms render correctly for trimmed clips (shows the right slice, not the whole file squashed).
- [ ] Waveform computation does not freeze the UI on a long file.
- [ ] The level meter moves with the audio; `getBands()` returns high `bass` on the kick of `test-beat.wav`.
- [ ] Removing assets/clips releases buffers and stops nodes (no growth after 20 import/remove cycles).

## Manual test script
1. Import `test-video-a.mp4`, `test-video-b.mp4`, `test-beat.wav`. Build: video A then B, beat on the audio track from 0s.
2. Play. Listen for the 440 Hz tone (A), then the 660 Hz tone (B), and the kick throughout.
3. Trim the beat clip to start 1s into the source and confirm the kick phase changes accordingly.
4. Toggle mute on the audio track, then change volume.
5. Open the debug overlay; confirm `bass` spikes on each kick.
6. Scrub quickly while playing; confirm no stuck sound.

## Do not
- Do not play audio through `<audio>` elements or the video elements anymore.
- Do not start the `AudioContext` before a user gesture.
- Do not store `AudioBuffer`s in Zustand (keep them inside `AudioEngine`); store only peaks.
- Do not implement export mixing or beat-bound effects yet.

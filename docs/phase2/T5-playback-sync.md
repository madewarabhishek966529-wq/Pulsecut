# T5: Playback engine (clock, multi-clip rendering, gaps, transport)

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T5.

## Goal
Replace the T1 stopgap with a real playback engine: a single master clock, correct frame selection across multiple clips and tracks, gap handling, smooth scrubbing, loop, frame stepping, and the full transport bar. After T5 the preview shows the edited timeline exactly as arranged.

## Scope
IN: `lib/playback.ts`, renderer upgrade to multi-clip, video element pool, transport and shortcuts, timecode.
OUT: audio-track scheduling and audio clock (T6). Build the clock abstraction so T6 can swap it in.

## Dependencies
None new.

## Requirements

### 1. Clock abstraction: `lib/playback.ts`
```ts
interface Clock {
  now(): number;                       // seconds on the timeline
  start(fromTime: number): void;
  stop(): void;
  isRunning(): boolean;
}
class PerformanceClock implements Clock { ... }  // uses performance.now() anchored at start()
class PlaybackController {
  constructor(deps: { getTimeline(): Timeline; renderer: PulsecutRenderer; clock: Clock; setTime(t: number): void; setPlaying(p: boolean): void; getLoop(): boolean })
  play(): void; pause(): void; toggle(): void;
  seek(t: number, opts?: { keepPlaying?: boolean }): void;
  stepFrames(n: number): void;
  setClock(clock: Clock): void;        // T6 will inject the audio-based clock
  dispose(): void;
}
```
- One `requestAnimationFrame` loop while playing. Each tick: `t = clock.now()`; if `t >= project.duration` then loop (seek 0 and continue) or pause at the end; call `renderer.render(timeline, t)`; write `playbackStore.currentTime` at most ~30 times per second (the playhead UI throttle) but ALWAYS pass the exact `t` to the renderer.
- The controller lives in a React context/provider or a singleton created in `EditorPage` and disposed on unmount (StrictMode safe).
- The visible tab can be hidden (`document.hidden`): rAF stops; on return, resync to the clock without jumping the video elements wildly.

### 2. Renderer upgrade (`lib/renderer.ts`)
- Support **all** video tracks: composite in track order (track 0 at the bottom; higher tracks on top), each active clip as a sprite using its `transform`.
- **Video element pool**: one `HTMLVideoElement` per **clip** (not per asset) so overlapping/adjacent clips never fight over the same element. Create lazily when a clip becomes active or is about to become active; release elements for clips that have been inactive for more than 5 seconds. Cap the pool at 6 elements; evict least recently used.
- **Preload next clip**: when a clip is within 1.5 seconds of becoming active, create its element, set `currentTime = sourceIn`, and let it buffer, so cuts are seamless.
- During playback: let each active element **play naturally** (`playbackRate = 1`), and only correct drift: if `|video.currentTime - expectedSourceTime| > 0.15` then hard-seek; if drift is 0.03 to 0.15 nudge `playbackRate` between 0.97 and 1.03 for a smooth catch-up. When paused or scrubbing: set `currentTime` directly, use `fastSeek` when available, coalesce seeks (only one in flight; remember the latest target and apply it after `seeked`).
- Elements for clips that are not active must be **paused**.
- Gaps (no clip): render the background only; do not freeze the last frame.
- Respect `track.muted` (hidden tracks are not drawn when the track is "muted" in the video lane meaning visibility off). Clip `transform.opacity` applies.
- Video element audio: keep video elements **unmuted only if** no audio engine exists yet (T5), so you can verify sync by ear; T6 will mute them and route audio through Web Audio. Add a single constant `VIDEO_ELEMENT_AUDIO = true` in the renderer with a `// TODO(T6)` note. Use the master volume 1.0 and honor `track.muted`.
- Expose `renderer.getFrameStats()` returning `{ fps, droppedFrames }` for the debug overlay below.

### 3. Transport: `components/editor/Transport.tsx` (rebuild)
- Buttons: go to start, step back 1 frame, play/pause, step forward 1 frame, go to end, loop toggle.
- Timecode `mm:ss:ff / mm:ss:ff` (current / total) in mono.
- Shortcuts (in `useEditorShortcuts`): `Space` play/pause, `Left/Right` 1 frame, `Shift+Left/Right` 1 second, `Home/End` start/end, `L` toggles loop, `J/K/L` is NOT required.
- Seek bar removed from T1 (the timeline ruler is the scrubber now).
- Wire the playhead scrub from T3: pointer-down on ruler calls `controller.pause()` (remember if it was playing), scrubbing calls `controller.seek(t)`, release resumes if it was playing.

### 4. Debug overlay (dev only)
Toggle with `Ctrl+Shift+D`: shows fps, dropped frames, active clip ids, pool size, current drift per active clip in ms. Hidden in production builds (`import.meta.env.DEV`).

### 5. Correctness rules
- `render(timeline, time)` stays a pure function of its arguments: the controller owns time, the renderer owns media elements only as a cache.
- Edits during playback (split, trim, move) must apply on the next frame without hiccups or stuck frames. Deleting the currently playing clip leaves a gap and continues the clock.
- End of timeline: pause, set time to `project.duration`, show the last frame (clamp render time to `duration - epsilon`).

## Edge cases
- Two clips back-to-back from the same asset (after a split): no stutter at the cut. The second element is already preloaded and seeked.
- Overlapping clips on two video tracks: both render, top track above.
- Seeking while playing keeps playing from the new time.
- Rapid play/pause toggling does not leak rAF loops (assert a single loop with a dev counter).
- Browser autoplay rules: `play()` starts from a user gesture; handle `NotAllowedError` with a toast.
- Large seeks to unbuffered ranges: show a subtle "buffering" state on the preview (spinner chip) if a seek takes more than 250ms.

## Acceptance checklist
- [ ] Typecheck passes, no console errors.
- [ ] Two clips (A then B) play end to end with a clean cut and no visible freeze at the boundary.
- [ ] After `S` split in the middle of a clip, playback across the split looks continuous.
- [ ] A gap between clips shows black, and playback continues through it to the next clip.
- [ ] Scrubbing the ruler updates frames immediately both while paused and while playing.
- [ ] Left/Right arrows step exactly one frame (timecode frame counter changes by 1).
- [ ] Loop works; end of timeline pauses when loop is off.
- [ ] Debug overlay shows drift under 100ms during a 60s run (loop the 6s clips ten times).
- [ ] Hiding the tab for 10s and returning does not desync or crash.
- [ ] No growth in video elements beyond the pool cap (check the overlay).

## Manual test script
1. Put A, a 1s gap, then B on the timeline; press Space and watch the gap and the cut.
2. Split A at 3s, trim, move around; keep playing while editing.
3. Hold Right arrow to step frames; scrub quickly; toggle loop.
4. Open the debug overlay and watch drift and fps for a minute.

## Do not
- Do not drive playback from `setInterval` or React state updates.
- Do not create video elements per frame.
- Do not implement audio-track scheduling here (T6).

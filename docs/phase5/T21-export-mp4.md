# T21: Client-Side MP4 Export with ffmpeg.wasm

Read `docs/phase5/00-MASTER.md` first. This task is ONLY T21.

## Goal
Implement in-browser MP4 video rendering and export without requiring backend GPU servers for standard edits. Use `@ffmpeg/ffmpeg` inside a Web Worker to capture rendered frames from `PulsecutRenderer`, mix audio via an `OfflineAudioContext`, and encode a clean H.264/AAC MP4 video directly downloadable by the creator.

---

## Scope
- **IN**: Web Worker export engine `client/src/workers/exportWorker.ts`, frame capture pipeline from `PulsecutRenderer`, offline audio mixdown in `client/src/lib/audioExport.ts`, progress reporting, and connection to `client/src/components/ExportDialog.tsx`.
- **OUT**: Server render queue (T22).

---

## Dependencies
- Client: `@ffmpeg/ffmpeg` (^0.12.0), `@ffmpeg/util`. Note: ensure Vite dev server sends cross-origin isolation headers (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`) for SharedArrayBuffer support.

---

## Requirements

### 1. Export Settings & Options
Export parameters configurable in `ExportDialog`:
- **Resolution**: `1080x1920` (9:16 vertical), `1920x1080` (16:9 landscape), `1080x1080` (1:1 square).
- **Frame Rate**: `30` or `60` fps.
- **Bitrate Preset**: Balanced (default, ~8 Mbps), High Quality (~15 Mbps).

### 2. Audio Mixdown: `client/src/lib/audioExport.ts`
Implement `renderTimelineAudio(timeline: Timeline): Promise<Uint8Array>`:
- Creates an `OfflineAudioContext(2, sampleRate * duration, sampleRate)`.
- Iterates over all audio and video clips containing audio:
  - Decodes audio buffers via `audioContext.decodeAudioData`.
  - Schedules buffer playback with exact `start`, `sourceIn`, and `volume`.
- Renders composite audio and encodes into an uncompressed 16-bit stereo WAV byte buffer.

### 3. Video Frame Capture Loop: `client/src/lib/videoExport.ts`
- Creates an offscreen `PulsecutRenderer` at export resolution (e.g. 1080x1920).
- Calculates total frames: `totalFrames = Math.ceil(duration * fps)`.
- For `frame = 0` to `totalFrames - 1`:
  - `time = frame / fps`.
  - Calls `renderer.render(timeline, time)`.
  - Extracts canvas image data (`canvas.toBlob("image/jpeg", 0.95)` or raw pixel buffer).
  - Feeds frame into the export worker.
  - Updates export progress: `(frame / totalFrames) * 80%`.

### 4. FFmpeg Multiplexer & Encoder: `workers/exportWorker.ts`
- Initializes `new FFmpeg()`. Loads wasm binaries.
- Writes frames sequentially: `frame_00001.jpg`, `frame_00002.jpg`, etc.
- Writes audio file: `audio.wav`.
- Runs FFmpeg command:
  ```bash
  ffmpeg -r 30 -i frame_%05d.jpg -i audio.wav \
    -c:v libx264 -pix_fmt yuv420p -preset faster \
    -c:a aac -b:a 192k \
    -shortest output.mp4
  ```
- Reads `output.mp4` file and creates a downloadable `Blob` URL.

### 5. Export Dialog Integration: `components/ExportDialog.tsx`
- Replace the mock timer in `ExportDialog.tsx`:
  - "Export Video" button launches the export pipeline.
  - Progress bar shows real percentage (0% to 100%).
  - Text readout shows `Rendering frame 45/300 (15%)` then `Encoding MP4...`.
  - When finished, displays a green success badge and a "Download Video (.mp4)" button triggering standard browser file download.

---

## Edge Cases to Handle
- SharedArrayBuffer / COOP & COEP: configure `vite.config.ts` headers to enable cross-origin isolation. Provide fallback notice if browser blocks multithreading.
- Out of Memory on long projects: do not store all frame blobs in RAM; write and flush frames incrementally to the FFmpeg virtual filesystem and delete them post-encode.
- Canceling export: provide a "Cancel" button that terminates the worker and releases memory immediately.

---

## Acceptance Checklist
- [ ] Exporting a 6-second video project from `samples/test-video-a.mp4` produces a valid playable `.mp4` file.
- [ ] Exported video preserves custom aspect ratio (9:16 portrait), letterboxing, and frame rate.
- [ ] Audio track (`samples/test-beat.wav`) is mixed and audible in the exported video in perfect sync.
- [ ] Progress bar updates accurately and smoothly during render.
- [ ] Canceling an export terminates the process without freezing the UI.


# T1: Import a video, show it on a PixiJS canvas, play/pause

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T1.

## Goal
User imports a video file. It appears on a PixiJS v8 canvas with correct aspect ratio and can be played, paused, and scrubbed with a simple seek bar. This builds the renderer foundation used by every later task.

## Scope
IN: editor page shell, media import, `PulsecutRenderer` (single clip), preview canvas component, minimal transport (play/pause + seek bar + time readout).
OUT: timeline UI, multiple clips, audio engine, effects, undo/redo, backend.

## Dependencies
No new ones. Use `pixi.js` (already installed). Do not add Pixi plugins.

## Requirements

### 1. Editor page shell: `pages/Editor.tsx`
- Route `/` renders `EditorPage` (set up routes in `App.tsx` with react-router; keep the health-check badge somewhere small like the top bar's right side).
- CSS grid layout per master doc: top bar 48px, left panel 320px, center preview, right panel 300px (empty placeholder), bottom timeline 280px (placeholder text "Timeline (T3)").
- Left panel shows `MediaPanel` with an "Import media" button and a list of imported assets (name, duration `mm:ss`, resolution). Hidden `<input type="file" accept="video/*">`. Also support drag-and-drop of files onto the panel.
- Use tokens/classes from `index.css` (`glass`, `btn-primary`, `skeleton`, colors). Include an empty state: icon, "No media yet", "Import media" button.

### 2. Media import: `lib/mediaImport.ts`
```ts
export async function importVideo(file: File): Promise<Asset & { name: string; objectUrl: string }>
```
- Create an object URL, load it into a detached `<video preload="metadata" muted playsinline>`, wait for `loadedmetadata` (reject after 10s with a clear error), read `duration`, `videoWidth`, `videoHeight`.
- Reject non-video MIME types and zero-duration files with a user-readable error.
- Return an `Asset` (`type: "video"`, `url` = object URL). Keep `name` for the UI.
- Provide `revokeAsset(asset)` that revokes the object URL. Call it when an asset is removed.

### 3. Store (temporary, will be rebuilt in T2)
In `store/timelineStore.ts` add minimal actions `addAsset(asset)`, `removeAsset(id)`. Keep `currentTime`, `isPlaying` there for now (T2 moves them). On first asset import, set `timeline.project.width/height` to the video's dimensions if the project is still empty, and set `project.duration` to the asset duration.
To make something visible without the timeline, auto-create ONE clip on the video track covering the whole asset when the first asset is imported (`start: 0, end: duration, sourceIn: 0`).

### 4. Renderer: `lib/renderer.ts`
Implement `PulsecutRenderer` exactly per the master contract.
- `init(container)`: `const app = new Application(); await app.init({ resizeTo: container, background: <token bg>, antialias: true, autoDensity: true, resolution: window.devicePixelRatio })`, append `app.canvas`. Must be **idempotent and StrictMode-safe**: guard against double init, and if `destroy()` is called while `init` is still awaiting, finish by destroying immediately (use an `initToken` or `destroyed` flag).
- Stage: a `Container` (the "project frame") sized to project width x height, scaled with **contain fit** into the canvas and centered; draw a dark rect as the project background. Recompute on resize (`app.renderer.on("resize", ...)`).
- Video source: keep one hidden `HTMLVideoElement` per asset (`muted`, `playsInline`, `preload="auto"`, `crossOrigin` not needed for object URLs). Create the Pixi texture from the video using the **PixiJS v8 video API** (read the v8 docs: `VideoSource` / `Texture`; disable `autoPlay` and control playback from the element). Do not guess the API.
- `render(timeline, time)`:
  - Find the clip on a video track that contains `time`. Compute `sourceTime = clip.sourceIn + (time - clip.start)`.
  - If the video element is paused and `|video.currentTime - sourceTime| > 1/fps/2`, set `video.currentTime = sourceTime`.
  - Fit the video sprite (contain) inside the project frame, respecting `clip.transform` (x, y, scale, rotation, opacity) even if the UI doesn't edit them yet.
  - If no clip at `time`, show only the background (black frame).
- Because a paused video texture does not auto-refresh after a seek, after the `seeked` event force a texture update (read the v8 docs for the right call) so scrubbing shows the new frame. Verify this works while paused.
- `destroy()`: stop and unload video elements, destroy textures/sprites, `app.destroy(true, { children: true, texture: true })`, remove listeners.

### 5. Preview component: `components/editor/PreviewCanvas.tsx`
- Creates the renderer in `useEffect`, passes the container ref, cleans up on unmount.
- Subscribes to the store and calls `renderer.render(timeline, currentTime)` whenever `timeline` or `currentTime` changes (a single effect, not per-frame React renders).
- During playback (T1 only): a `requestAnimationFrame` loop reads `video.currentTime` from the active clip and writes `currentTime` into the store at most 30 times per second (T5 replaces this with a proper clock). Stop the loop on pause/unmount.
- Shows a skeleton while the renderer initializes and an error message if init fails (for example WebGL unsupported).

### 6. Transport: `components/editor/Transport.tsx`
- Play/Pause button (Space shortcut when the focus is not in an input), seek bar (`<input type="range">` styled with tokens) bound to `currentTime` over `project.duration`, timecode `mm:ss:ff` in mono font.
- Play: call `video.play()` on the active element via the renderer (`renderer.play()` / `renderer.pause()` helper methods are allowed for T1 only, mark them `// TODO(T5): replaced by PlaybackController`). Handle the promise rejection from `play()`.
- On reaching `project.duration`, pause and stay at the end.

## Edge cases to handle
- Importing a second video: add to the asset list only (do not create another clip in T1).
- Very large files: no whole-file reads into memory; object URLs only.
- Window resize: canvas stays crisp and centered.
- Removing the only asset: preview goes back to the empty state without errors.
- StrictMode double mount: exactly one canvas in the DOM, no "already destroyed" errors.

## Acceptance checklist
- [ ] `npm run typecheck` passes, no console errors.
- [ ] Importing `samples/test-video-a.mp4` shows it on the canvas, correct aspect (portrait), centered, letterboxed.
- [ ] Play/Pause works, Space toggles, video progresses, timecode updates.
- [ ] Dragging the seek bar while paused updates the frame immediately (no stale frame).
- [ ] Resizing the browser window keeps the video fitted.
- [ ] Only one canvas element exists in the DOM after hot reload and in StrictMode.
- [ ] Removing the asset clears the preview and revokes the object URL.
- [ ] Importing a `.txt` file renders a friendly error, not a crash.

## Manual test script
1. `cd client && npm run dev`, open the app.
2. Import `samples/test-video-a.mp4`. Confirm the test pattern appears.
3. Press Space, watch the timecode run, press Space again.
4. Drag the seek bar around while paused.
5. Resize the window. Open the console: no errors.
6. Import a text file: error message appears.
7. Remove the asset: empty state returns.

## Do not
- Do not build the timeline UI, effects, or audio engine.
- Do not render the video in a DOM `<video>` element on screen. It must come through Pixi so effects work later.
- Do not store `HTMLVideoElement` or Pixi objects in Zustand.

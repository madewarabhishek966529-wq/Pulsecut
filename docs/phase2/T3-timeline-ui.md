# T3: Timeline UI (tracks, clips, ruler, playhead, zoom)

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T3.

## Goal
A professional-looking, performant multi-track timeline that **displays** the timeline JSON, supports zoom/scroll, playhead scrubbing, and clip selection. Editing by dragging comes in T4.

## Scope
IN: layout, ruler, tracks, clip blocks, playhead, zoom, scroll, selection, track header controls (mute, lock, add track).
OUT: drag/trim/split (T4), audio waveforms (T6), thumbnails inside clips (optional later).

## Dependencies
None new. Use Pointer Events, not mouse events. No drag-and-drop library.

## Requirements

### 1. `lib/timeScale.ts` (pure + unit tests with vitest)
```ts
timeToPx(t: number, pxPerSecond: number): number
pxToTime(px: number, pxPerSecond: number): number
getRulerTicks(pxPerSecond: number, viewStart: number, viewEnd: number): { time: number; major: boolean; label?: string }[]
formatTimecode(t: number, fps: number): string   // "mm:ss:ff"
zoomAround(pxPerSecond: number, factor: number, anchorTime: number, scrollX: number, anchorPx: number): { pxPerSecond: number; scrollX: number }
```
- Ticks adapt to zoom: choose a step from `[1/fps, 0.1, 0.5, 1, 2, 5, 10, 30, 60]` seconds so major ticks are at least 80px apart and minor ticks at least 10px apart. Labels only on major ticks.
- `zoomAround` keeps the time under the cursor stationary while zooming.

### 2. Layout: `components/editor/Timeline.tsx`
```
┌───────────────┬───────────────────────────────────────────┐
│ toolbar (zoom, snapping toggle, add track)                │
├───────────────┼───────────────────────────────────────────┤
│ corner        │ TimeRuler (sticky top)                    │
├───────────────┼───────────────────────────────────────────┤
│ Track headers │ Track lanes (scroll horizontally)         │
│ (fixed 120px) │ Playhead overlay spans ruler + lanes      │
└───────────────┴───────────────────────────────────────────┘
```
- Headers column is fixed; lanes area scrolls horizontally and vertically in sync with headers vertically (single scroll container for rows with `position: sticky` headers is fine).
- Total scrollable width = `max(project.duration + 10s padding, viewport) * pxPerSecond`.
- Height: fills the 280px bottom area. Track height 56px; Audio 56px; Text 40px.

### 3. `TimeRuler.tsx`
- Renders ticks for the **visible range only** (virtualize by `scrollX` and viewport width).
- Pointer down + drag on the ruler scrubs: sets `playbackStore.currentTime` (clamped), uses `setPointerCapture`, works while playing (pauses playback during scrub and restores on release if it was playing).
- Shows a timecode chip following the playhead.

### 4. `Playhead.tsx`
- A 2px cyan line (`--color-pulse`) with a glowing triangle handle at the top, positioned with `transform: translateX(...)` only.
- Subscribes to `currentTime` directly with a narrow selector so that ONLY the playhead re-renders on every tick.
- Draggable handle (same scrub logic as the ruler).
- Auto-follow: during playback, if the playhead moves past 85% of the viewport width, scroll lanes so the playhead is at 15% (smooth, only when playing and "follow" is enabled; add a small toggle).

### 5. `TrackRow.tsx` and `TrackHeader.tsx`
- Header: track icon by type, name ("Video 1"), mute (eye/speaker) and lock toggles that call `apply(...)` on the timeline (add small pure ops `setTrackFlag(tl, trackId, "muted" | "locked", value)` to `timelineOps.ts` with tests).
- Lane background: subtle alternating row color and vertical grid lines every major tick (CSS background gradient, not DOM nodes).
- Locked tracks: dim and show a lock icon; clips not selectable.

### 6. `ClipBlock.tsx`
- Position: `transform: translateX(timeToPx(start))`, `width: timeToPx(end - start)` (width is allowed to change layout; avoid `left`).
- Look (DESIGN.md): 10px radius, track-type color at 25% fill, 1px solid track color border, label top-left (asset name or text), duration chip bottom-right in mono, selected state with cyan outline + glow.
- Memoized with `React.memo` and a custom comparator (id, start, end, selected, pxPerSecond). Playback ticks must never re-render clips.
- Click selects (Shift/Ctrl+Click adds). Click on empty lane clears selection and moves the playhead to the click time.
- Hidden hover handles are NOT needed yet (T4), but reserve a `data-handle` structure so T4 can add them without refactoring.

### 7. Zoom and scroll
- `Ctrl/Cmd + wheel` zooms around the cursor (factor 1.1 per notch). Plain wheel scrolls horizontally when `shift` is held, otherwise vertical scroll of tracks. Trackpad horizontal scroll works.
- Toolbar: `-` / `+` buttons, a zoom slider (10 to 600 px/s, logarithmic feel), "Fit" button (zoom to fit the whole project in the viewport).
- Keyboard: `=`/`+` zoom in, `-` zoom out, `\` fit.
- Persist zoom in `uiStore` only (no localStorage).

### 8. Add track
Toolbar dropdown: "Add video track", "Add audio track", "Add text track" using `addTrack`. Max 8 tracks per type for now.

## Performance requirements
- With 6 tracks and 200 clips (generate with a dev-only "Stress test" button), scrubbing stays smooth, and the React profiler shows no clip re-render while the playhead moves.
- Ruler renders at most ~100 DOM nodes at any zoom.

## Edge cases
- Zoom to minimum with a very long project: no giant DOM widths (`max` width guard).
- Resize of the window/panel updates visible range (use `ResizeObserver`).
- Empty timeline shows a friendly hint in the video lane: "Drag media here".
- Clip narrower than 24px hides label and duration chip.

## Acceptance checklist
- [ ] Typecheck and tests pass (`timeScale` has tests for tick choice and `zoomAround`).
- [ ] The imported clip from T1 appears on Video 1 with the right width; resizing zoom changes its width proportionally.
- [ ] Clicking/dragging the ruler scrubs the preview in sync.
- [ ] Ctrl+wheel zoom keeps the point under the cursor fixed.
- [ ] Selecting a clip highlights it; clicking empty space deselects.
- [ ] Mute/lock toggles work and are undoable.
- [ ] Stress test: smooth with 200 clips; no clip re-renders during playback (verified in profiler).
- [ ] Layout matches `design/DESIGN.md` colors and spacing.

## Manual test script
1. Import `test-video-a.mp4` and `test-video-b.mp4` (use the dev "Add to timeline" action from the media panel if T4 is not done: it appends the asset as a clip at the end of the video track via `addClip`).
2. Zoom in/out with the slider and Ctrl+wheel, scrub from the ruler, press Space and watch the follow behavior.
3. Toggle lock on Video 1 and try selecting a clip.
4. Run the stress test and scrub quickly.

## Do not
- Do not implement dragging/trimming/splitting.
- Do not use a canvas for the timeline in this task (DOM is fine at this scale).
- Do not read `currentTime` in `Timeline` or `ClipBlock` components.

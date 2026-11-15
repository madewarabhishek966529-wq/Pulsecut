# T4: Clip operations (drag, trim, split, delete, duplicate, snap, drop from media)

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T4.

## Goal
Make the timeline editable like a real NLE: move clips, trim edges, split at the playhead, delete, duplicate, drag media in, with magnetic snapping and full undo/redo.

## Scope
IN: pointer-based drag/trim, snapping, keyboard shortcuts, media drag-and-drop onto tracks, context toolbar for the selected clip.
OUT: playback sync (T5), audio (T6), effects.

## Dependencies
None new. Use Pointer Events and HTML5 drag-and-drop only for media from the panel.

## Requirements

### 1. Snapping: `lib/snapping.ts` (pure + tests)
```ts
getSnapPoints(tl: Timeline, opts: { playheadTime: number; excludeClipIds: string[] }): number[]
// points: 0, playhead, every clip start and end on all tracks (except excluded), project end
snapTime(t: number, points: number[], thresholdPx: number, pxPerSecond: number): { time: number; snappedTo: number | null }
```
- Threshold 8px. Snapping can be disabled by the toolbar toggle (`uiStore.snappingEnabled`) or by holding **Alt** during a drag.
- For moves, test both the clip's start and its end against snap points; use whichever is closer.
- Show a vertical snap guide line (1px cyan, full timeline height) at the snapped time while dragging. Render it in `Timeline`, driven by `uiStore.snapGuideTime | null`.

### 2. Move (drag clip body)
- Pointer down on a clip body selects it (if not already) and starts a drag after 3px of movement (so simple clicks stay clicks).
- On start: `beginTransaction()`. On move: compute the new start from pointer delta, apply snapping, call `updateTransaction(tl => moveClip(tl, clipId, newStart, targetTrackId))`. On release: `commitTransaction()`. On `Escape` while dragging: `cancelTransaction()`.
- Vertical drag moves between tracks of the same type. Determine the target track from the pointer Y (row hit-test via `data-track-id` and `elementsFromPoint` or row bounds). Highlight the target lane. Invalid targets (wrong type or locked) show a "not-allowed" cursor and keep the original track.
- Multi-select drag: all selected clips move together by the same delta (use a `moveClips` helper in `timelineOps` that either moves all or none, with tests). If any selected clip is on a locked track, block.
- Auto-scroll the lanes horizontally when dragging near the viewport edges (smooth, 40px edge zone, speed proportional to distance).
- Overlap handling is done by `moveClip` clamping from T2, so the dragged clip stops flush against neighbors. The UI must reflect the clamped position, not the raw pointer.

### 3. Trim handles
- Hovering a clip reveals 8px handles on both edges (cursor `ew-resize`, small cyan bar). Dragging a handle runs a transaction using `trimClip`. Snapping applies to the edge being dragged.
- Show a live tooltip with the new duration (mono font) near the pointer while trimming.
- Respect source limits (`sourceIn`, `asset.duration`) via `trimClip`; the handle simply stops when the limit is reached.

### 4. Split, delete, duplicate
- **Split** at the playhead: shortcut `S`, or toolbar scissors. Target: selected clips under the playhead; if nothing is selected, all unlocked clips under the playhead on all tracks. One undo step for all splits (use `apply` with a composed op). After splitting, select the right-hand clip.
- **Delete**: `Delete` / `Backspace` removes selected clips. `Shift+Delete` = ripple delete: removes the clip and shifts later clips on the same track left by its length (add `rippleDelete(tl, clipIds)` to `timelineOps` with tests).
- **Duplicate**: `Ctrl/Cmd+D` places a copy right after the original (existing op).
- **Select all** `Ctrl/Cmd+A`, **Escape** clears selection.
- All shortcuts register in `useEditorShortcuts.ts`, ignore input fields, and never fire while the user is dragging.

### 5. Drag media from the panel to the timeline
- Make `MediaPanel` items draggable (`draggable`, `dataTransfer.setData("application/x-pulsecut-asset", assetId)`).
- Lanes accept drops: compute drop time from pointer X (with snapping), create a clip with `addClip` (full asset duration, `sourceIn: 0`). Video assets go to video tracks; audio assets to audio tracks; wrong type shows a "not-allowed" state. Show a ghost clip preview (a translucent block following the pointer) while dragging over a lane.
- Also add a quick "Add to timeline" button on each media item: appends at the end of the first compatible unlocked track.
- If the project is empty and a video is dropped, keep the project size from T1 logic.

### 6. Selection toolbar
A small floating bar above the selected clip (or in the timeline toolbar when anything is selected): Split, Duplicate, Delete, and a disabled "Effects" placeholder. Buttons have tooltips with shortcuts.

### 7. Cursor and feedback
- Cursor changes: `grab` / `grabbing` for body, `ew-resize` for handles, `not-allowed` for invalid targets.
- Dragged clip gets `opacity: 0.9` and a slight lift (`transform: translateY(-1px)` plus glow). No layout animations; transform and opacity only.

## Edge cases
- Dragging to negative time clamps to 0.
- Trimming a clip to the minimum length (1 frame) stops there.
- Splitting exactly at a clip edge does nothing (no zero-length clips).
- Dropping onto a locked track is rejected with a toast ("Track is locked").
- Pointer leaves the window during drag: continue with pointer capture; release outside commits.
- A drag that changes nothing must not create a history entry.

## Acceptance checklist
- [ ] Typecheck and tests pass (`snapping.ts` and `moveClips`/`rippleDelete` covered).
- [ ] Moving a clip snaps to the playhead and neighboring edges, with the guide line visible; Alt disables snapping.
- [ ] Clips never overlap, even with fast drags.
- [ ] Trim both edges works, respects the source length, and a single undo reverts the whole trim.
- [ ] `S` splits at the playhead; two clips result and the preview plays both parts correctly (basic check).
- [ ] Delete, Shift+Delete (ripple), Duplicate, Select all, Escape all work.
- [ ] Dragging media from the panel to a track creates a clip at the drop position; the wrong track type is rejected.
- [ ] Drag across tracks works for same-type tracks only; locked tracks are protected.
- [ ] A long drag produces exactly one undo step.

## Manual test script
1. Add `test-video-a.mp4` and `test-video-b.mp4` to the timeline.
2. Drag B before A; drag it near A's end and watch it snap.
3. Trim A's right edge to 3s; trim B's left edge by 1s and confirm B's preview starts 1s into the source.
4. Move the playhead to 2s, press `S`, delete the middle piece with Shift+Delete and confirm the gap closes.
5. Undo/redo through all steps.
6. Lock the track and try dragging: blocked.

## Do not
- Do not put pointer position or drag state in the timeline store (use refs/local state; only `snapGuideTime` and selection live in `uiStore`).
- Do not mutate clip objects while dragging; use transactions.
- Do not add a drag-and-drop library.

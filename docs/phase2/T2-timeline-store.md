# T2: Timeline operations, stores, and undo/redo

Read `docs/phase2/00-MASTER.md` first. This task is ONLY T2. It is mostly logic with almost no new UI.

## Goal
A clean, tested editing core: pure timeline operations, a store with undo/redo and drag-coalescing transactions, and separate stores for playback and UI state. Every later task (UI, drag, split, AI patches in Phase 4) edits the timeline through these operations only.

## Scope
IN: `lib/id.ts`, `lib/timelineOps.ts` (+ unit tests), `store/timelineStore.ts` rewrite, `store/playbackStore.ts`, `store/uiStore.ts`, keyboard undo/redo, migrate T1 code to the new stores.
OUT: timeline UI (T3), drag handles (T4), audio (T6).

## Dependencies
Allowed new dev dependency: `vitest` (unit tests for pure functions). Add scripts `"test": "vitest run"`. No other new dependencies. No immer; use plain immutable updates.

## Requirements

### 1. `lib/timelineOps.ts` (pure, no React, no store)
Each function takes a `Timeline` and returns a **new** `Timeline` (never mutate). If an operation is invalid, return the same timeline object unchanged and never throw for normal user errors.

```ts
addTrack(tl, type, index?): Timeline
removeTrack(tl, trackId): Timeline
addClip(tl, trackId, clip: Omit<Clip,"id"> & { id?: string }): Timeline   // places at clip.start, resolves overlap (see rules)
removeClip(tl, clipId): Timeline
moveClip(tl, clipId, newStart: number, targetTrackId?: string): Timeline  // same-type tracks only
trimClip(tl, clipId, edge: "start" | "end", newTime: number): Timeline   // newTime is a timeline time
splitClip(tl, clipId, time: number): Timeline                            // creates two clips, second gets new id
duplicateClip(tl, clipId): Timeline                                      // placed right after original
setClipTransform(tl, clipId, patch: Partial<Clip["transform"]>): Timeline
recomputeDuration(tl): Timeline                                          // project.duration = max clip.end
findClip(tl, clipId): { track: Track; clip: Clip; trackIndex: number; clipIndex: number } | null
clipsAt(tl, time): Clip[]                                                // clips active at time (start <= time < end)
```

### 2. Rules (invariants) the ops must guarantee
- `start >= 0`, `end > start`, minimum clip length **1 frame** (`1/fps`).
- Clips on the same track never overlap. `moveClip` and `addClip` **clamp to the nearest free position**: if the desired spot overlaps, place the clip flush against the nearest neighbor boundary on the side the drag came from; if the gap is too small for the clip, do not move.
- Clips are kept **sorted by `start`** inside each track.
- `moveClip` to another track only if `track.type` matches and the track is not `locked`. Locked tracks reject all edits.
- `trimClip` for media clips respects the source: start trim increases/decreases `sourceIn` by the same delta (cannot go below 0), end trim cannot extend beyond `asset.duration - sourceIn`. Text clips (no asset) can extend freely.
- `splitClip` only if `start + minLen <= time <= end - minLen`. Left clip: `end = time`. Right clip: `start = time`, `sourceIn += (time - original.start)`, effects are deep-copied with new ids.
- After every op that changes clips, `project.duration` is recomputed.
- Floating point: round times to 1 millisecond (`Math.round(t * 1000) / 1000`) to avoid drift.

### 3. Unit tests: `lib/timelineOps.test.ts`
Cover at least: add on empty track, add overlapping (clamps), move with overlap, move across track types (rejected), trim start with sourceIn, trim end beyond asset (clamped), split in the middle and near edges (rejected), duplicate, remove updates duration, locked track rejects edits, sorted order after moves. Aim for 20+ test cases. `npm run test` must pass.

### 4. `store/timelineStore.ts` rewrite
```ts
interface TimelineState {
  timeline: Timeline;
  past: Timeline[]; future: Timeline[];       // snapshots, cap 100
  addAsset(asset: Asset): void;               // not undoable-spammy: assets are part of timeline, undoable ok
  removeAsset(assetId: string): void;         // also removes clips using it
  apply(op: (tl: Timeline) => Timeline): void;           // one undo step
  beginTransaction(): void;                   // for drags
  updateTransaction(op: (tl: Timeline) => Timeline): void; // live updates, no history entries
  commitTransaction(): void;                  // pushes ONE history entry (only if changed)
  cancelTransaction(): void;                  // restores the snapshot taken at begin
  undo(): void; redo(): void;
  canUndo: boolean; canRedo: boolean;
  setTimeline(tl: Timeline): void;            // resets history
}
```
- Snapshots share structure (they are immutable); do not deep-clone.
- Any new `apply` clears `future`.
- During a transaction the UI sees live changes; undo after commit reverts the whole drag in one step.
- Identity matters: if an op returns the same object, do not push history or re-render.

### 5. `store/playbackStore.ts`
`currentTime`, `isPlaying`, `loop`, `setCurrentTime`, `setPlaying`, `toggleLoop`, `seekBy(delta)`. `setCurrentTime` clamps to `[0, project.duration]` (read duration via a function parameter or a getter passed at creation, avoid circular imports).

### 6. `store/uiStore.ts`
`selectedClipIds: string[]`, `select(id, additive?)`, `clearSelection()`, `pxPerSecond` (default 80, range 10 to 600), `setZoom()`, `scrollX`, `snappingEnabled` (default true), `activeLeftTab`. Selection must be cleared of ids that no longer exist when the timeline changes (subscribe in the store or via a helper).

### 7. Migration + shortcuts
- Move T1 usage (`currentTime`, `isPlaying`) to `playbackStore`; update `PreviewCanvas`, `Transport`, `MediaPanel`.
- Global keyboard hook `lib/useEditorShortcuts.ts` (mounted once in `EditorPage`): `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` and `Ctrl+Y` redo. Ignore when focus is in an input/textarea/contenteditable.
- Add small Undo/Redo icon buttons in the top bar, disabled when unavailable.
- Use selectors everywhere (`useTimelineStore(s => s.timeline.tracks)`) to avoid broad re-renders.

## Edge cases
- Removing an asset while clips use it: clips removed, one undo step restores all.
- `cancelTransaction` with no active transaction: no-op.
- Nested `beginTransaction`: ignore the second call and warn in dev.
- Undo past empty history: no-op.

## Acceptance checklist
- [ ] `npm run test` passes with 20+ cases, `npm run typecheck` clean.
- [ ] All ops are pure (a test asserts the input timeline is not mutated, using `Object.freeze` deep-freeze on inputs).
- [ ] Undo/redo works from the keyboard and the top-bar buttons after import, add, remove.
- [ ] A transaction of 50 `updateTransaction` calls produces exactly 1 history entry.
- [ ] No component imports `timelineOps` and mutates directly; all edits go through `apply` or transactions.
- [ ] T1 features (import, play, seek) still work after migration.

## Manual test script
1. Import a video; confirm a clip is created, press `Ctrl+Z`: the clip/asset disappears; `Ctrl+Shift+Z`: it returns.
2. Open the React DevTools profiler or add temporary logging: changing `currentTime` must NOT re-render `MediaPanel`.
3. Run `npm run test`.

## Do not
- Do not build timeline UI or drag logic.
- Do not put `currentTime` back into the timeline store.
- Do not deep-clone the timeline on each op.

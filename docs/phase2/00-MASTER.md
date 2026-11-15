# Phase 2 Master Brief: Core Editor (T1 to T6)

## Goal of Phase 2
A working basic video editor in the browser: import media, arrange clips on a multi-track timeline, trim/split/move/delete with undo/redo, play everything in sync (video + audio), and see audio waveforms. No effects yet (Phase 3), no backend yet (Phase 5).

## How to use these prompts in Antigravity
1. Open the `pulsecut/` folder as the workspace. The rules in `.agent/rules/pulsecut.md` apply automatically (if your build does not load them, paste that file into Customizations > Rules).
2. Start a **new conversation per task**. Paste the full task file (for example `T1-canvas-playback.md`) as your first message.
3. Use **Planning mode**. Review the plan, approve, let the agent build, then run the manual test script yourself.
4. Do not start the next task until the current one passes its acceptance checklist. Commit after each task (`git commit -m "T1: canvas playback"`).
5. If the agent drifts, paste: "Stop. Re-read the task file. You changed files outside the scope. Revert those."

Order: T1, T2, T3, T4, T5, T6.

## Shared contracts (all tasks must respect these)

### Units and ids
- All times in **seconds** (float). Frame = `1 / project.fps`.
- IDs via `crypto.randomUUID()` wrapped in `client/src/lib/id.ts` (`newId(prefix?: string)`).

### Types
Use `client/src/types/timeline.ts` (Timeline, Track, Clip, Asset). Extend it only where a task says so (for example `volume` on Clip in T6) and keep the Zod schema and the inferred type in sync.

### Files and responsibilities
```
client/src/
├── lib/
│   ├── id.ts              newId()
│   ├── timeScale.ts       time <-> px helpers, ruler tick math        (T3)
│   ├── timelineOps.ts     PURE functions: add/remove/split/move/trim   (T2)
│   ├── mediaImport.ts     File -> Asset (probe metadata, object URL)   (T1)
│   ├── renderer.ts        PulsecutRenderer (PixiJS), pure render()     (T1, T5)
│   ├── playback.ts        PlaybackController + Clock                   (T5)
│   ├── audioEngine.ts     AudioContext graph, decode, schedule         (T6)
│   └── waveform.ts        peak extraction + cache                      (T6)
├── store/
│   ├── timelineStore.ts   timeline + history (undo/redo)               (T2)
│   ├── playbackStore.ts   currentTime, isPlaying, loop                 (T2)
│   └── uiStore.ts         selection, zoom, scroll, snapping toggle     (T2)
├── components/editor/     PreviewCanvas, Timeline, TimeRuler, TrackRow, ClipBlock, Playhead, Transport, MediaPanel
└── pages/Editor.tsx       layout shell
```

### Renderer contract
```ts
class PulsecutRenderer {
  init(container: HTMLElement): Promise<void>;   // idempotent, StrictMode-safe
  setProject(width: number, height: number): void;
  setAssets(assets: Asset[]): void;              // registers media sources
  render(timeline: Timeline, time: number): void; // pure: draws the frame for `time`
  destroy(): void;                               // releases everything
}
```
`render` must not read from React or Zustand. It receives everything as arguments.

### Layout (from design/DESIGN.md)
Top bar 48px, left panel 320px, right inspector 300px, bottom timeline 280px (resizable later), center preview. Dark theme using tokens from `client/src/index.css`. If `/design/exports/` has Stitch output, use it as visual reference, but tokens in `DESIGN.md` win.

### Sample media for testing
`/samples/test-video-a.mp4`, `/samples/test-video-b.mp4` (6s, 540x960, tone audio) and `/samples/test-beat.wav` (8s, kick every 0.5s). Copy to `client/public/samples/` if you want one-click "Load samples" for dev (dev-only button, hidden in production builds).

### Performance budget
Scrubbing and playback preview at 1080x1920 project size should hold 60fps on a mid laptop. Timeline UI must not re-render all clips on every playhead tick (use selectors and memoization).

### Definition of done (every task)
- `npm run typecheck` passes with zero errors.
- No console errors or warnings during the manual test script.
- No memory leaks: repeatedly importing and removing clips does not grow object URLs or Pixi textures.
- Task file's acceptance checklist is fully ticked.
- `docs/TASKS.md` updated.

## Report format the agent must end with
1. Summary (3 lines max)
2. Files changed (list)
3. How I verified (commands + what I saw in the browser)
4. Known limitations / follow-ups

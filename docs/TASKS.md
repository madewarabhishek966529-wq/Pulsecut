# Pulsecut: Build Tasks
Do one at a time. Tick when it works in the browser.

## Phase 0: Foundation
- [x] Repo, docs, scaffold

## Phase 1: Design
- [x] Design system written (`design/DESIGN.md`) and Stitch prompts ready (`design/stitch/`)
- [x] Generate screens in Stitch in order: Editor, Dashboard, Prompt-to-Filter, Export, Landing (see `design/stitch/README.md`)
- [x] Save Stitch exports to `/design/exports/`
- [x] Theme tokens defined in `client/src/index.css`

## Phase 2: Core editor
- [x] T1: Upload a video, show it on a PixiJS canvas, play/pause  (prompt: `docs/phase2/T1-canvas-playback.md`)
- [ ] T2: Timeline types + Zustand store + undo/redo  (prompt: `docs/phase2/T2-timeline-store.md`)
- [ ] T3: Timeline UI: render tracks and clips, zoom, playhead scrub  (prompt: `docs/phase2/T3-timeline-ui.md`)
- [ ] T4: Clip operations: drag, trim, split, delete, snap  (prompt: `docs/phase2/T4-clip-operations.md`)
- [ ] T5: Playback loop synced to timeline and audio clock  (prompt: `docs/phase2/T5-playback-sync.md`)
- [ ] T6: Audio track + waveform  (prompt: `docs/phase2/T6-audio-waveform.md`)

## Phase 3: Effects engine
- [ ] T7: Effect registry + shader pipeline (one effect on one clip)
- [ ] T8: Built-ins: glitch, RGB split, VHS, zoom pulse, blur
- [ ] T9: Effects panel + auto-generated sliders from uniforms
- [ ] T10: Transitions between clips
- [ ] T11: Keyframes for effect params

## Phase 4: Hero features
- [ ] T12: Prompt-to-Filter: server route + Gemini + Zod validation  (prompt: `docs/phase4/T12-prompt-to-filter.md`)
- [ ] T13: Client shader validator + auto-fix loop + save to library  (prompt: `docs/phase4/T13-shader-validator.md`)
- [ ] T14: Audio analysis (Web Audio FFT) -> uBass/uMid/uHigh/uBeat  (prompt: `docs/phase4/T14-audio-analysis.md`)
- [ ] T15: Parameter bindings UI (bind param to bass/beat)  (prompt: `docs/phase4/T15-param-bindings.md`)
- [ ] T16: Edit-by-Chat: JSON patch pipeline + ChatPanel  (prompt: `docs/phase4/T16-edit-by-chat.md`)
- [ ] T17: Auto-captions  (prompt: `docs/phase4/T17-auto-captions.md`)

## Phase 5: Backend and export
- [ ] T18: Auth (register/login/Google) + protected routes  (prompt: `docs/phase5/T18-auth.md`)
- [ ] T19: Projects CRUD + autosave  (prompt: `docs/phase5/T19-projects-crud.md`)
- [ ] T20: Asset upload (S3 / Object Storage)  (prompt: `docs/phase5/T20-asset-upload.md`)
- [ ] T21: Export MP4 with ffmpeg.wasm  (prompt: `docs/phase5/T21-export-mp4.md`)
- [ ] T22: Server render queue (BullMQ)  (prompt: `docs/phase5/T22-server-render-queue.md`)

## Phase 6: Polish and launch
- [ ] T23: Page transitions, skeletons, empty states, error states
- [ ] T24: Landing page + demo reel
- [ ] T25: Deploy, README with GIFs, 60-second demo video

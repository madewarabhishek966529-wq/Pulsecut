# Pulsecut: Architecture

## Folders
```
client/src/
├── main.tsx, App.tsx, index.css
├── types/            timeline.ts, effects.ts
├── store/            timelineStore.ts, uiStore.ts, historyStore.ts
├── components/
│   ├── editor/       Canvas, Timeline, Track, Clip, Playhead, Toolbar
│   ├── panels/       EffectsPanel, AssetsPanel, Inspector, ChatPanel
│   └── ui/           Button, Modal, Slider, Skeleton
├── effects/          registry.ts, builtin/*.glsl.ts
├── lib/              renderer.ts, playback.ts, audioAnalysis.ts, api.ts, shaderValidator.ts
└── pages/            Dashboard, Editor, Login

server/src/
├── index.ts, app.ts
├── config/           env.ts, db.ts
├── models/           User, Project, Asset, CustomEffect, RenderJob
├── routes/           auth, projects, assets, ai, effects, render, health
├── schemas/          timeline.ts, ai.ts (Zod)
├── services/         gemini.ts, render.ts, storage.ts
└── middleware/       auth, validate, errorHandler
```

## Data flow
```
User action -> Zustand timelineStore (JSON) -> Renderer(timeline, t) -> PixiJS canvas
                      |                                  ^
                      +-- autosave (debounced) -> API    +-- audioAnalysis (FFT) -> uBass/uMid/uHigh/uBeat
```

## Renderer
- Pure function: given `timeline` and `time`, draw the frame.
- Per clip: video texture -> apply effect chain (each effect = one filter pass) -> composite by track order.
- Playback loop uses `requestAnimationFrame` and an audio-clock-driven `currentTime`.
- Use low-res proxy video for preview if frame time exceeds budget.

## Export
- v1: `ffmpeg.wasm` in a Web Worker, rendering frames from the same renderer and encoding.
- v2: server render queue (BullMQ + Redis) for long or heavy projects. Same timeline JSON.

## AI safety boundary
All Gemini calls happen on the server. Shader output is untrusted: schema-validated on the server, compiled in a hidden WebGL context on the client, retry cap of 3.

## Deployment
Client on Vercel, API on Render or Railway, MongoDB Atlas, media on Cloudinary or S3.

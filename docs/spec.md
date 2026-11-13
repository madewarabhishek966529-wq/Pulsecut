# Pulsecut: Product Spec

## 1. Vision
A web video editor like CapCut whose edge is AI: describe a filter in words and get a real-time GPU shader, drive effects from music, and edit the timeline by chat.

**Tagline:** Edit at the speed of the beat.

## 2. Users
Short-form creators (reels, shorts, TikTok), students, and anyone who wants stylized edits without learning shader code.

## 3. MVP features
1. Auth (email + Google), project dashboard
2. Upload video/audio/images; play on canvas
3. Multi-track timeline: trim, split, move, delete, zoom, snap
4. Effects panel with built-in shader filters and intensity sliders
5. Text overlays with animation presets
6. Audio track with waveform
7. Export MP4 (1080x1920 and 1920x1080)

## 4. Hero features (what makes it unique)
1. **Prompt-to-Filter**: user types a description, Gemini returns a GLSL fragment shader plus uniform metadata, the app validates it and previews live, sliders are auto-generated.
2. **Beat/Stem Reactive Effects**: bind audio features (bass, mids, highs, beat) to effect parameters.
3. **Edit by Chat**: natural language commands become JSON patches on the timeline.

## 5. Timeline JSON (source of truth)
```json
{
  "version": 1,
  "project": { "fps": 30, "width": 1080, "height": 1920, "duration": 12.5 },
  "assets": [
    { "id": "a1", "type": "video", "url": "https://...", "duration": 8.2, "width": 1080, "height": 1920 }
  ],
  "tracks": [
    {
      "id": "t1", "type": "video", "locked": false, "muted": false,
      "clips": [
        {
          "id": "c1", "assetId": "a1",
          "start": 0, "end": 5,
          "sourceIn": 1.0,
          "transform": { "x": 0, "y": 0, "scale": 1, "rotation": 0, "opacity": 1 },
          "effects": [
            {
              "id": "e1", "effectId": "glitch",
              "params": { "intensity": 0.6 },
              "bindings": [{ "param": "intensity", "source": "bass", "gain": 1.2 }],
              "keyframes": []
            }
          ]
        }
      ]
    },
    { "id": "t2", "type": "text", "clips": [] },
    { "id": "t3", "type": "audio", "clips": [] }
  ]
}
```
Times are in seconds. `start`/`end` are positions on the timeline; `sourceIn` is the offset inside the asset.

## 6. Effect registry format
```ts
interface EffectDef {
  id: string;                 // "glitch"
  name: string;               // "Glitch"
  kind: "filter" | "transition" | "generated";
  fragment: string;           // GLSL ES 1.00 or 3.00 source
  uniforms: UniformDef[];     // drives UI sliders
  defaults: Record<string, number | number[]>;
}
interface UniformDef {
  name: string; type: "float" | "vec2" | "vec3" | "color";
  min?: number; max?: number; step?: number; label: string;
}
```
Standard uniforms provided by the renderer: `uTexture`, `uTime`, `uResolution`, `uProgress`, `uBass`, `uMid`, `uHigh`, `uBeat`.

## 7. Prompt-to-Filter pipeline
1. Client sends `POST /api/ai/filter { prompt }`.
2. Server asks Gemini for strict JSON: `{ name, fragment, uniforms[], defaults }`, with the standard uniforms and rules in the system prompt.
3. Server validates JSON with Zod and runs basic static checks (size cap, no forbidden constructs).
4. Client compiles the shader in a hidden WebGL context.
5. On compile error, client sends the error to `POST /api/ai/filter/fix`. Max 3 retries.
6. On success, the effect is added to the registry, previewed, and can be saved to the user's library.

## 8. Edit-by-Chat pipeline
1. Client sends `{ command, timelineSummary }`.
2. Server asks Gemini for a JSON patch array (`add_clip`, `remove_clip`, `split`, `add_effect`, `set_param`, `move`).
3. Server validates each op against a Zod union; client applies via the store as one undoable transaction.

## 9. Data models (MongoDB)
**User**: `email, passwordHash?, googleId?, name, createdAt`
**Project**: `ownerId, title, thumbnailUrl, timeline (Mixed), createdAt, updatedAt`
**Asset**: `ownerId, projectId, type, url, publicId, duration, width, height, size, createdAt`
**CustomEffect**: `ownerId, name, prompt, fragment, uniforms[], defaults, isPublic, createdAt`
**RenderJob**: `projectId, status (queued|running|done|failed), progress, outputUrl, error, createdAt`

## 10. API
```
POST   /api/auth/register | /login | /google
GET    /api/auth/me
GET    /api/projects            POST /api/projects
GET    /api/projects/:id        PUT  /api/projects/:id     DELETE /api/projects/:id
POST   /api/assets/upload       GET  /api/assets?projectId=
POST   /api/ai/filter           POST /api/ai/filter/fix
POST   /api/ai/edit             POST /api/ai/captions
GET    /api/effects             POST /api/effects          (custom effects)
POST   /api/render              GET  /api/render/:id
GET    /api/health
```

## 11. Non-goals (v1)
4K editing, collaboration, mobile app, plugin system.

## 12. Success criteria
- Timeline edits feel instant (<16ms frame time at 1080p preview)
- Prompt-to-filter works on 8 of 10 prompts within 3 retries
- A 30s 1080p project exports without crashing
- 60-second demo video that shows prompt-to-filter live

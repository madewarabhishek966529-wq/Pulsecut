# Phase 4 Master Brief: Hero Features (T12 to T17)

## Goal of Phase 4
Implement Pulsecut's signature differentiator capabilities:
1. **Prompt-to-Filter**: Turn natural language text prompts into production-ready WebGL GLSL fragment shaders via Google Gemini API, complete with auto-generated uniform sliders and client-side compile verification with auto-fix loop.
2. **Beat & Audio Reactive Engine**: Real-time Web Audio FFT analysis streaming dynamic frequency band energies (`uBass`, `uMid`, `uHigh`, `uBeat`) into the renderer and binding effect parameters directly to the rhythm of the music.
3. **Edit-by-Chat**: Conversational timeline editing transforming user natural language instructions into atomic, validated JSON patch transactions applied cleanly to the timeline store with full undo/redo.
4. **Auto-Captions**: Audio transcription generating accurately timed text clips on the text track.

---

## How to Use These Prompts in Antigravity
1. Open the workspace root (`Pulsecut/`). Hard rules from `.agent/rules/pulsecut.md` and `CLAUDE.md` apply to every task.
2. Work through tasks in order: **T12 -> T13 -> T14 -> T15 -> T16 -> T17**.
3. For each task, start a new conversation and paste the matching prompt file (e.g. `docs/phase4/T12-prompt-to-filter.md`).
4. Always follow **Planning Mode**: review the implementation plan, verify dependencies, implement, verify with tests/browser, and update `docs/TASKS.md`.
5. Gemini API key (`GEMINI_API_KEY`) lives exclusively in `server/.env`. Never expose or pass API keys to the browser client.

---

## Shared Contracts (All Phase 4 Tasks Must Respect These)

### 1. GLSL ES 1.00 Fragment Shader Specification
All AI-generated or custom shader filters run on WebGL/WebGPU through PixiJS v8 and must strictly conform to:
```glsl
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uTime;        // Current playback time in seconds
uniform vec2 uResolution;   // Viewport resolution in pixels (e.g. 1080.0, 1920.0)
uniform float uProgress;    // Clip normalized progress (0.0 at start, 1.0 at end)
uniform float uBass;        // Normalized low-frequency energy [0.0, 1.0]
uniform float uMid;         // Normalized mid-frequency energy [0.0, 1.0]
uniform float uHigh;        // Normalized high-frequency energy [0.0, 1.0]
uniform float uBeat;        // Transient beat impulse [0.0, 1.0] with decay

// Custom uniforms declared here dynamically...

void main() {
  vec2 uv = vTextureCoord;
  vec4 color = texture2D(uTexture, uv);
  // Filter logic...
  gl_FragColor = color;
}
```

### 2. Uniform Definition Schema
Each effect defines uniform metadata that drives the UI inspector sliders:
```ts
export type UniformType = "float" | "vec2" | "vec3" | "color";

export interface UniformDef {
  name: string;
  type: UniformType;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number | number[];
}

export interface EffectDef {
  id: string;
  name: string;
  kind: "filter" | "transition" | "generated";
  prompt?: string;
  fragment: string;
  uniforms: UniformDef[];
  defaults: Record<string, number | number[]>;
}
```

### 3. Audio Analysis Contract
Web Audio API extraction running on the master audio output:
- **Sample Rate**: 44.1kHz / 48kHz, FFT Size: 1024 (frequency bin width ~43Hz), Smoothing Time Constant: 0.8.
- **Bands**:
  - `uBass`: 20Hz - 250Hz (bins 1 to 6). Normalized root-mean-square energy.
  - `uMid`: 250Hz - 4000Hz (bins 6 to 93). Normalized energy.
  - `uHigh`: 4000Hz - 16000Hz (bins 93 to 372). Normalized energy.
  - `uBeat`: Peak onset detection with decay envelope: jumps to 1.0 on bass transients (> 1.4x local energy history), decays exponentially with a 120ms half-life.

### 4. Parameter Binding Contract
In `client/src/types/timeline.ts`:
```ts
export interface Binding {
  param: string; // uniform name, e.g. "intensity"
  source: "bass" | "mid" | "high" | "beat";
  gain: number;  // multiplier, default 1.0, range [-3.0, 3.0]
}
```
During rendering:
`computedValue = clamp(baseValue + audioValues[source] * gain * (max - min), min, max)`

### 5. Timeline JSON Patch Specification (Edit-by-Chat)
Operations returned by Gemini are executed as an atomic transactional batch:
```ts
export type TimelinePatchOp =
  | { op: "add_clip"; trackId: string; clip: Partial<Clip> }
  | { op: "remove_clip"; clipId: string }
  | { op: "move_clip"; clipId: string; newStart: number; targetTrackId?: string }
  | { op: "trim_clip"; clipId: string; edge: "start" | "end"; newTime: number }
  | { op: "split_clip"; clipId: string; time: number }
  | { op: "add_effect"; clipId: string; effectId: string; params?: Record<string, number> }
  | { op: "set_param"; clipId: string; effectId: string; param: string; value: number }
  | { op: "bind_param"; clipId: string; effectId: string; param: string; source: "bass"|"mid"|"high"|"beat"; gain?: number };
```

---

## Security & Sandboxing Rules
1. **AI GLSL is Untrusted Code**:
   - Must be verified in a headless, detached WebGL context before touching the Pixi scene graph.
   - Disallow unbounded `while` loops, infinite recursions, texture calls outside `uTexture`, and extensions. Cap source size at 8,192 bytes.
2. **Server-Side AI Secrets**:
   - `GEMINI_API_KEY` is loaded in `server/src/config/env.ts` and never passed to the client.
   - All AI endpoints must validate input length and enforce rate limiting.
3. **Safe JSON Patches**:
   - Reject any patch operation containing unknown properties or invalid timeline IDs.
   - All patch operations must pass through `timelineOps.ts` invariants (no overlaps, valid bounds).

---

## Definition of Done (Every Phase 4 Task)
- `npm run typecheck` passes with zero errors on both `client` and `server`.
- No console errors or WebGL memory leaks (all textures, buffers, and audio nodes cleaned up).
- Tested against real media in `samples/` (`test-video-a.mp4`, `test-beat.wav`).
- Acceptance checklist for the task is fully satisfied.
- Updated `docs/TASKS.md`.


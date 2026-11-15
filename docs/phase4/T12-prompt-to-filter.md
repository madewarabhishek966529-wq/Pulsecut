# T12: Prompt-to-Filter — Server Route, Gemini API & Zod Validation

Read `docs/phase4/00-MASTER.md` first. This task is ONLY T12.

## Goal
Implement the server-side Prompt-to-Filter endpoint (`POST /api/ai/filter`). The user provides a text prompt (e.g. "Warm vintage VHS look with scanlines and amber glow"). The server calls Google Gemini API, enforces a strict structured JSON schema for the GLSL fragment shader and uniform metadata, validates it with Zod, and returns a verified filter definition to the client.

---

## Scope
- **IN**: Server endpoint `POST /api/ai/filter`, Gemini API client integration in `server/src/services/gemini.ts`, Zod validation schemas in `server/src/schemas/ai.ts`, static GLSL security and syntax pre-checks, rate limiting & error handling.
- **OUT**: Client WebGL compiler (T13), auto-fix loop (T13), audio reactive analysis (T14).

---

## Dependencies
- Server: `@google/genai` or `@google/generative-ai` (allowed dependency for AI integration).
- Ensure `GEMINI_API_KEY` is present in `server/.env`.

---

## Requirements

### 1. Zod Schema: `server/src/schemas/ai.ts`
Define and export the strict schema matching the contract:
```ts
import { z } from "zod";

export const UniformTypeSchema = z.enum(["float", "vec2", "vec3", "color"]);

export const UniformDefSchema = z.object({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: UniformTypeSchema,
  label: z.string().max(32),
  min: z.number().default(0),
  max: z.number().default(1),
  step: z.number().default(0.01),
  default: z.union([z.number(), z.array(z.number())]),
});

export const GeneratedFilterSchema = z.object({
  name: z.string().min(1).max(50),
  fragment: z.string().min(20).max(8192),
  uniforms: z.array(UniformDefSchema).max(8),
  defaults: z.record(z.union([z.number(), z.array(z.number())])),
});

export const FilterPromptRequestSchema = z.object({
  prompt: z.string().min(3).max(500),
});
```

### 2. Gemini Service: `server/src/services/gemini.ts`
Implement `generateFilterShader(prompt: string): Promise<GeneratedFilter>`:
- Uses `gemini-2.5-flash` with structured JSON output (`responseMimeType: "application/json"`).
- **System Instruction**:
  ```
  You write GLSL ES 1.00 fragment shaders for a video filter in Pulsecut.
  Output ONLY valid JSON matching this schema:
  {
    "name": "Human-readable name (2-4 words)",
    "fragment": "Complete GLSL ES 1.00 shader code string",
    "uniforms": [
      { "name": "uIntensity", "type": "float", "label": "Intensity", "min": 0.0, "max": 1.0, "step": 0.01, "default": 0.5 }
    ],
    "defaults": { "uIntensity": 0.5 }
  }

  Shader Requirements:
  - Must begin with `precision mediump float;`
  - Must declare `varying vec2 vTextureCoord;` and `uniform sampler2D uTexture;`
  - May declare standard uniforms: `uniform float uTime;`, `uniform vec2 uResolution;`, `uniform float uProgress;`, `uniform float uBass;`, `uniform float uMid;`, `uniform float uHigh;`, `uniform float uBeat;`
  - Must declare custom uniforms matching the `uniforms` array.
  - Must compute output color and assign to `gl_FragColor`.
  - Disallow `#extension`, dynamic while loops, memory allocations, or unbounded loops.
  - Maximum 8 custom uniforms.
  ```

### 3. Static Security & Sanitizer Check
Before returning the shader, inspect `fragment`:
- Reject `#extension`, `#include`, `discard`, `system`, `while\s*\(true\)`.
- Ensure it contains `gl_FragColor` and `vTextureCoord`.
- Enforce size cap (< 8192 chars).

### 4. API Route: `server/src/routes/ai.ts`
- `POST /api/ai/filter`:
  - Validates request body with `FilterPromptRequestSchema`.
  - Returns `400` if prompt is empty or exceeds limit.
  - Returns `503` if `GEMINI_API_KEY` is unset with actionable message: `"Gemini API key is not configured in server/.env"`.
  - Returns `200` with the validated JSON payload `{ success: true, filter: GeneratedFilter }`.

---

## Edge Cases to Handle
- Quota limit / Rate limits from Gemini: return `429` with retry-after header or clear message.
- Gemini returns markdown fences (```json ... ```): strip fences before JSON parsing.
- Malformed JSON from model: catch parsing error and retry once internally before returning 502.

---

## Acceptance Checklist
- [ ] `POST /api/ai/filter` with body `{"prompt": "retro 80s synthwave neon glow"}` returns 200 with valid JSON.
- [ ] Response matches `GeneratedFilterSchema`: includes `name`, `fragment`, `uniforms`, and `defaults`.
- [ ] Fragment shader contains valid GLSL ES 1.00 declarations (`precision mediump float;`, `gl_FragColor`).
- [ ] Rejects prompts with invalid bodies or missing prompt with status 400.
- [ ] Safe failure with 503 when `GEMINI_API_KEY` is missing.
- [ ] Zero TypeScript errors in `server/`.

---

## Manual Test Script
1. Add a valid key to `server/.env`: `GEMINI_API_KEY=your_key_here`.
2. Start server: `npm run dev --prefix server`.
3. In terminal, test with curl:
   ```bash
   curl -X POST http://localhost:4000/api/ai/filter \
     -H "Content-Type: application/json" \
     -d "{\"prompt\": \"dramatic film noir black and white with high contrast\"}"
   ```
4. Verify response status is 200 and the JSON contains compilable GLSL source code.


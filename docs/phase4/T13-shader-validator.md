# T13: Client Shader Validator, Auto-Fix Loop & Prompt-to-Filter Modal

Read `docs/phase4/00-MASTER.md` and `docs/phase4/T12-prompt-to-filter.md` first. This task is ONLY T13.

## Goal
Connect the AI-generated shaders to the browser: validate compilation in a headless WebGL context, orchestrate an automatic server-side repair loop (`POST /api/ai/filter/fix`) if GLSL syntax errors occur (up to 3 attempts), dynamically render uniform sliders in `PromptToFilterModal.tsx`, provide live filter preview on a video frame, and allow applying the filter to the active clip or saving it to the library.

---

## Scope
- **IN**: Client shader compiler `client/src/lib/shaderValidator.ts`, server route `POST /api/ai/filter/fix`, client retry loop (max 3 retries), dynamic slider controls in `client/src/components/PromptToFilterModal.tsx`, applying generated effect to the selected clip in `timelineStore`.
- **OUT**: Audio FFT analysis (T14), timeline chat editing (T16).

---

## Dependencies
- None. Uses standard WebGL (`WebGLRenderingContext`) and existing React/PixiJS setup.

---

## Requirements

### 1. Client WebGL Shader Validator: `client/src/lib/shaderValidator.ts`
Implement `compileAndValidateShader(fragmentSource: string): { success: boolean; error?: string }`:
- Creates an offscreen canvas (`1x1`) and acquires `webgl` (or `experimental-webgl`) context.
- Compiles a standard passthrough vertex shader:
  ```glsl
  attribute vec2 aPosition;
  varying vec2 vTextureCoord;
  void main() {
    vTextureCoord = (aPosition + 1.0) / 2.0;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
  ```
- Creates a `FRAGMENT_SHADER` with `fragmentSource` and calls `gl.compileShader(shader)`.
- Checks `gl.getShaderParameter(shader, gl.COMPILE_STATUS)`.
- If false, extracts error log via `gl.getShaderInfoLog(shader)`.
- Deletes created shader objects to avoid GPU memory leaks.
- Returns `{ success: true }` or `{ success: false, error: log }`.

### 2. Server Auto-Fix Endpoint: `POST /api/ai/filter/fix`
In `server/src/routes/ai.ts`:
- Accepts `{ prompt: string, fragment: string, error: string }`.
- Sends to Gemini with the fix prompt:
  ```
  The following GLSL ES 1.00 fragment shader failed to compile with error:
  [ERROR]

  Failed Shader Source:
  [SOURCE]

  Original User Intent: [PROMPT]

  Output the corrected JSON only, adhering to the same schema (name, fragment, uniforms, defaults).
  Fix syntax errors, undefined identifiers, type mismatches (e.g. float vs int), or precision issues.
  ```
- Validates the repaired JSON with Zod before returning.

### 3. Client Auto-Fix Loop in UI: `lib/filterGenerator.ts`
Implement `generateAndValidateFilter(prompt: string, onProgress?: (status: string) => void)`:
1. Calls `POST /api/ai/filter`.
2. Compiles shader with `compileAndValidateShader`.
3. If compilation fails:
   - Increments retry counter (up to 3 times).
   - Calls `POST /api/ai/filter/fix` passing the compiler error message.
   - Re-tests compiled output.
4. If still failing after 3 attempts, reports user-friendly error with option to edit prompt.

### 4. Wire `PromptToFilterModal.tsx`
- Replace mock timeout with `generateAndValidateFilter`.
- Dynamic Sliders: Instead of hardcoded sliders, map over `filter.uniforms`:
  - Renders label, numeric input, and range slider bound to `min`, `max`, and `step`.
- Preview Stage:
  - Render an offscreen Pixi / WebGL preview applying the compiled shader to a sample frame or active timeline frame.
  - Interactive comparison slider (split screen before/after).
- Apply Button:
  - Adds the new effect instance `{ id: newId("effect"), effectId: filter.name, params: currentParams }` to the selected clip on the video track in `timelineStore`.

---

## Edge Cases to Handle
- Browser WebGL context loss: catch exceptions and recreate the validator context.
- Gemini produces WebGL 2.0 syntax (e.g. `texture()` instead of `texture2D()`, `in/out` instead of `varying`): validator catches this and the fix prompt instructs GLSL ES 1.00.
- Empty prompt or offline state: graceful error notification toast.

---

## Acceptance Checklist
- [ ] Submitting a prompt in `PromptToFilterModal` triggers server generation and client WebGL validation.
- [ ] If a compilation error occurs, the auto-fix loop runs transparently and succeeds within 3 retries.
- [ ] Generated uniforms dynamically populate the inspector sliders in the modal.
- [ ] Adjusting uniform sliders updates the preview frame in real time.
- [ ] Clicking "Apply" attaches the effect to the active clip on the timeline.
- [ ] No WebGL context leaks or unreleased shaders in dev tools.


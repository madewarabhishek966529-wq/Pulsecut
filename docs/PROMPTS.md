# Pulsecut: Prompts

## Agent starter (every session)
> Read `CLAUDE.md`, `docs/spec.md` and `docs/ARCHITECTURE.md`. Implement **[TASK ID + title]** from `docs/TASKS.md` only. Show a short plan first. Don't modify unrelated files. When done, list changed files and how I can test it.

## Task 1 example
> Implement T1: video upload and playback on a PixiJS v8 canvas in `client/`. Add a file input, load the video into a texture, show it in a canvas that fits the preview area, with play/pause. TypeScript strict, no extra dependencies except `pixi.js`.

## Stitch / v0 style line
> Dark video editor UI, near-black background, neon cyan-violet pulse accent, glass panels with subtle borders, 8px grid, Inter font, smooth micro-interactions, hover states, loading skeletons, empty states.

## Stitch screen prompts
1. **Editor**: "Design a desktop video editor called Pulsecut. Left: assets and effects tabs. Center: video preview canvas with playback controls. Right: inspector with sliders. Bottom: multi-track timeline with video, text and audio tracks, waveform, playhead and zoom slider. [style line]"
2. **Dashboard**: "Project dashboard with a grid of video project cards (thumbnail, title, last edited), a New Project button, and a sidebar. [style line]"
3. **Prompt-to-Filter modal**: "Modal with a text prompt box, example prompt chips, a live preview of the generated filter on a sample frame, auto-generated sliders, and Save to Library button. [style line]"
4. **Export dialog**: "Export dialog with resolution, fps, format selectors, a progress bar and a Download button. [style line]"
5. **Landing page**: "Hero with tagline 'Edit at the speed of the beat', animated waveform, demo video, feature grid, CTA. [style line]"

## Gemini system prompt (Prompt-to-Filter)
> You write GLSL ES 1.00 fragment shaders for a video filter. Output ONLY JSON: `{ "name": string, "fragment": string, "uniforms": [{ "name": string, "type": "float|vec2|vec3|color", "min": number, "max": number, "step": number, "label": string }], "defaults": object }`. The shader must use `precision mediump float;`, `varying vec2 vTextureCoord;`, and `uniform sampler2D uTexture;`. Available standard uniforms: `uTime`, `uResolution`, `uProgress`, `uBass`, `uMid`, `uHigh`, `uBeat`. Write the final color to `gl_FragColor`. No loops with non-constant bounds. No comments outside the JSON.

## Fix prompt
> The shader failed to compile with this error: `[ERROR]`. Here is the source: `[SOURCE]`. Return the corrected JSON in the same format.

## Debug prompt
> Expected: [what should happen]. Actual: [what happens]. Console error: [paste]. Relevant file: [path]. Find the cause before changing code.

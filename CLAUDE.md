# Pulsecut: Agent Rules

Read `docs/spec.md` and `docs/ARCHITECTURE.md` before any task. Work from `docs/TASKS.md`.

## Workflow
1. Do ONE task from TASKS.md per session. Do not touch unrelated files.
2. Show a short plan first, then code.
3. After finishing: list changed files, how to test, and tick the task box.
4. If the spec is ambiguous, ask one question instead of guessing.
5. Never invent new dependencies without saying why.

## Stack
- Client: React 18, Vite, TypeScript (strict), Tailwind v4, Zustand, TanStack Query, Framer Motion, PixiJS v8
- Server: Node, Express, TypeScript, Mongoose, Zod
- AI: Gemini API (server-side only, key never reaches the client)

## Code rules
- TypeScript strict, no `any`. Validate all API input and AI output with Zod.
- The timeline JSON (see spec) is the single source of truth. UI edits it; the renderer reads it.
- Renderer must be a pure function of (timeline, currentTime). No hidden state.
- Animations: only `transform` and `opacity` in the UI. Target 60fps.
- Components small, one per file. Hooks in `lib/`. Shaders in `effects/`.
- Every async call has loading and error states. Skeletons, not spinners.
- Server routes: thin controllers, validation middleware, errors via a single handler.
- AI-generated GLSL is untrusted: compile in an isolated hidden context, cap retries at 3, never eval anything else.

## Done means
Runs without console errors, typechecks, and the feature works in the browser.

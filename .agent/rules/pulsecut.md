# Pulsecut: Workspace Rules (always on)

You are building **Pulsecut**, a browser-based AI video editor. Before ANY task read: `CLAUDE.md`, `docs/spec.md`, `docs/ARCHITECTURE.md`, `design/DESIGN.md`, and the task file you were given in `docs/phase2/`.

## Process (every task)
1. Use **Planning mode**. Produce an implementation plan artifact listing: files to create/modify, new dependencies (with reason), risks, and how you will verify. Stop and wait for approval if the plan adds a dependency not allowed by the task file.
2. Implement ONLY the task given. Do not refactor or touch unrelated files.
3. Verify: run `npm run typecheck` in `client/` (and `server/` if touched), run the dev server, and test in the browser using the task's manual test script. Use the sample media in `/samples`.
4. Finish with a report: changed files, how to test, known limitations, and tick the task in `docs/TASKS.md`.

## Hard rules
- TypeScript strict. No `any`, no `@ts-ignore`.
- Timeline JSON (`client/src/types/timeline.ts`) is the single source of truth. Time unit is **seconds**.
- Renderer is a pure function of `(timeline, time)`. No UI state inside it.
- Never guess library APIs. For PixiJS v8 and Web Audio, read the current docs before writing code.
- Do not add dependencies unless the task allows it.
- UI animations: `transform` and `opacity` only. Honor `prefers-reduced-motion`.
- Clean up everything you create: object URLs, rAF loops, event listeners, Pixi objects, AudioContext nodes. React StrictMode double-mounts effects, so init/teardown must be idempotent.
- Every async path has loading and error UI. No silent failures.
- Style with tokens from `client/src/index.css`. Do not hardcode colors.
- If anything in the spec is ambiguous or contradictory, ask ONE concise question instead of guessing.

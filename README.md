# Pulsecut

AI-native video editor for the web. Write a prompt, get a GPU shader filter. Bind effects to the beat.

## Structure
```
pulsecut/
├── CLAUDE.md          # rules for the AI coding agent (read first)
├── docs/              # spec, architecture, tasks, prompts
├── client/            # React + Vite + TS editor
└── server/            # Node + Express + MongoDB API
```

## Quick start
```bash
# server
cd server && cp .env.example .env && npm install && npm run dev
# client (new terminal)
cd client && cp .env.example .env && npm install && npm run dev
```
Client: http://localhost:5173  |  API: http://localhost:4000/api/health

## Build process
Open `docs/TASKS.md` and work through it one task at a time with your coding agent. Use the starter prompts in `docs/PROMPTS.md`.

## Phase 2 with Antigravity
Open this workspace. Rules load from `.agent/rules/pulsecut.md`. For each task T1 to T6, follow the matching prompt in `docs/phase2/`, use Planning mode, and verify with `samples/`. Start with `docs/phase2/00-MASTER.md`.

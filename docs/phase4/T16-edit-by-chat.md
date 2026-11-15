# T16: Edit-by-Chat — Natural Language Timeline Editing & Patch Pipeline

Read `docs/phase4/00-MASTER.md` first. This task is ONLY T16.

## Goal
Allow users to edit their timeline through plain English natural language commands (e.g. "Cut out the first 2 seconds", "Split the clip at 4s and add a glitch effect on the beat", "Move the second video right after the first"). Gemini interprets the timeline state and returns a sequence of atomic JSON patch operations, which the client validates and executes as a single undoable transaction.

---

## Scope
- **IN**: Server endpoint `POST /api/ai/edit`, Gemini timeline patch prompt and Zod schema, client patch executor in `lib/patchExecutor.ts`, `ChatPanel` UI component in the Left Panel or floating drawer, batch undo/redo transaction.
- **OUT**: Voice input (Phase 6), auto-captions (T17).

---

## Dependencies
- Server: Gemini API with structured JSON output.
- Client: existing `timelineOps.ts` and `timelineStore.ts`.

---

## Requirements

### 1. Patch Operation Schema: `server/src/schemas/ai.ts` & `client/src/types/patch.ts`
```ts
import { z } from "zod";

export const TimelinePatchOpSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("add_clip"),
    trackId: z.string(),
    clip: z.object({
      assetId: z.string(),
      start: z.number().nonnegative(),
      end: z.number().positive(),
      sourceIn: z.number().nonnegative().default(0),
    }),
  }),
  z.object({
    op: z.literal("remove_clip"),
    clipId: z.string(),
  }),
  z.object({
    op: z.literal("split_clip"),
    clipId: z.string(),
    time: z.number().positive(),
  }),
  z.object({
    op: z.literal("trim_clip"),
    clipId: z.string(),
    edge: z.enum(["start", "end"]),
    newTime: z.number().nonnegative(),
  }),
  z.object({
    op: z.literal("move_clip"),
    clipId: z.string(),
    newStart: z.number().nonnegative(),
    targetTrackId: z.string().optional(),
  }),
  z.object({
    op: z.literal("add_effect"),
    clipId: z.string(),
    effectId: z.string(),
    params: z.record(z.number()).optional(),
  }),
  z.object({
    op: z.literal("bind_param"),
    clipId: z.string(),
    effectId: z.string(),
    param: z.string(),
    source: z.enum(["bass", "mid", "high", "beat"]),
    gain: z.number().default(1),
  }),
]);

export const EditResponseSchema = z.object({
  explanation: z.string().max(200),
  ops: z.array(TimelinePatchOpSchema),
});
```

### 2. Server Route: `POST /api/ai/edit`
In `server/src/routes/ai.ts`:
- Accepts `{ command: string, timelineSummary: object }`.
- System Instruction:
  ```
  You are an expert video editor AI for Pulsecut.
  Given the current timeline summary and the user's natural language command, produce a list of atomic timeline patch operations.
  Rules:
  - Do not create overlapping clips on the same track.
  - All times are in seconds.
  - Return JSON matching { "explanation": string, "ops": TimelinePatchOp[] }.
  ```
- Validates the returned patch with `EditResponseSchema`.

### 3. Client Patch Executor: `lib/patchExecutor.ts`
Applies ops atomically using `timelineOps.ts`:
- Validates all target clip IDs and track IDs exist before applying.
- Executes all ops in a single transaction in `timelineStore.ts` so the user can undo the entire AI edit with one `Ctrl+Z`.

### 4. UI: `ChatPanel.tsx` in `LeftPanel`
- Tab in LeftPanel with chat conversation interface.
- Input box with example action chips:
  - "Trim first 2 seconds"
  - "Split at current time"
  - "Add pulse effect on the bass drop"
- When AI responds:
  - Displays natural language explanation.
  - Shows visual summary of proposed changes (e.g. `Split Clip 1 at 00:03.00`, `Add Glitch Effect`).
  - Action button: "Apply to Timeline".

---

## Edge Cases to Handle
- Vague or impossible command (e.g. "make it look cool"): AI explains what it plans to do or asks for clarification rather than executing random destructive ops.
- Invalid clip IDs: patch executor aborts the transaction without corrupting the timeline state.
- Undo/redo: single `undo()` restores timeline state prior to all ops in the batch.

---

## Acceptance Checklist
- [ ] Asking "split this clip in half" generates a valid `split_clip` operation at the midpoint.
- [ ] Asking "add glitch on the beat" adds the effect and creates an audio binding to `beat`.
- [ ] Clicking "Apply" updates the timeline immediately.
- [ ] Pressing `Ctrl+Z` reverts all changes made by the AI edit in a single step.


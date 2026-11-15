# T17: Auto-Captions — Speech-to-Text & Timed Text Track Clips

Read `docs/phase4/00-MASTER.md` first. This task is ONLY T17.

## Goal
Automatically transcribe spoken audio in a video or audio track, generate phrase-level timestamps, and create timed text clips on the text track (`t-text`) so creators get instant viral TikTok/Reels captions with modern typography presets.

---

## Scope
- **IN**: Server endpoint `POST /api/ai/captions`, Gemini audio transcription with start/end timestamp intervals, client creation of text clips on `t-text`, subtitle font styling and animation preset configuration in `client/src/components/Inspector.tsx`.
- **OUT**: Multi-lingual real-time translation (v2), custom font upload (Phase 5).

---

## Dependencies
- Server: Gemini 2.5 Flash multimodal audio transcription.

---

## Requirements

### 1. Server Route: `POST /api/ai/captions`
In `server/src/routes/ai.ts`:
- Accepts either:
  - Audio file upload via `multipart/form-data`, or
  - Public asset URL.
- Passes audio chunks to Gemini with transcription prompt:
  ```
  Transcribe the spoken audio into short, punchy caption phrases (1-4 words per phrase for short-form video style).
  Output JSON format:
  [
    { "text": "EDIT AT THE SPEED", "start": 0.0, "end": 1.2 },
    { "text": "OF THE BEAT", "start": 1.2, "end": 2.1 }
  ]
  All times in seconds (float). Start and end must not overlap.
  ```
- Validates the timestamp array with Zod:
  `z.array(z.object({ text: z.string(), start: z.number().nonnegative(), end: z.number().positive() }))`

### 2. Client Insertion on Text Track: `store/timelineStore.ts`
Implement `applyAutoCaptions(captions: Array<{ text: string; start: number; end: number }>)`:
- Locates track with `type: "text"` (or creates one if not present).
- Clears existing generated captions or appends.
- Creates `Clip` objects:
  ```ts
  const clip: Clip = {
    id: newId("caption"),
    start: c.start,
    end: c.end,
    sourceIn: 0,
    text: c.text,
    transform: { x: 0, y: 350, scale: 1, rotation: 0, opacity: 1 },
    effects: [],
  };
  ```
- Recomputes project duration.

### 3. Subtitle Customization in Inspector: `components/Inspector.tsx`
When a text/caption clip is selected:
- Text font size, uppercase toggle, text color (with color picker / presets).
- Preset animation styles:
  - **Pop in** (spring scale 0.8 -> 1.0)
  - **Karaoke Glow** (accent color highlight)
  - **Minimal Fade**

---

## Edge Cases to Handle
- Media has no speech / instrumental only: returns empty array with friendly message `"No clear speech detected in this audio"`.
- Background music interference: Gemini transcription handles moderate music background; handles low confidence gracefully.
- Timeline duration sync: captions never extend past the video/audio track duration.

---

## Acceptance Checklist
- [ ] Clicking "Generate Auto-Captions" sends the audio track to `/api/ai/captions`.
- [ ] Accurately timed text clips appear automatically on the text track on the timeline.
- [ ] Scrubbing the playhead renders the synchronized text overlay on top of the preview canvas.
- [ ] Text styling (font size, position, presets) can be edited in the Inspector.
- [ ] Zero TypeScript errors and clean undo/redo support.


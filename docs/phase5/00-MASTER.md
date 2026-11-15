# Phase 5 Master Brief: Backend and Export (T18 to T22)

## Goal of Phase 5
Transform Pulsecut from a client-side prototype into a complete cloud-connected web application:
1. **User Authentication & Identity (T18)**: Secure registration, email/password login, Google OAuth, JWT authentication middleware, and client session state.
2. **Projects CRUD & Autosave (T19)**: Full MongoDB persistence for video projects, optimistic concurrency, and debounced background autosaving with dirty state detection.
3. **Asset Upload & Cloud Storage (T20)**: Robust media file uploads to S3/Object Storage with asset tracking in MongoDB.
4. **Client-Side MP4 Export (T21)**: Browser-based rendering using `ffmpeg.wasm` inside a Web Worker, extracting frames from `PulsecutRenderer` and audio from an `OfflineAudioContext` into standard H.264/AAC MP4.
5. **Server Render Queue (T22)**: Background cloud rendering queue with BullMQ and Redis for heavy high-fps or long-duration projects.

---

## How to Use These Prompts in Antigravity
1. Open the workspace root (`Pulsecut/`). Work through tasks in strict order: **T18 -> T19 -> T20 -> T21 -> T22**.
2. For each task, start a new conversation and paste the matching prompt file (e.g. `docs/phase5/T18-auth.md`).
3. Follow **Planning Mode**: generate an implementation plan artifact, verify dependencies, implement, verify with tests/manual verification, and update `docs/TASKS.md`.
4. Keep server secrets (`JWT_SECRET`, `MONGODB_URI`, `S3_BUCKET`, `REDIS_URL`) in `server/.env`.

---

## Shared Contracts (All Phase 5 Tasks Must Respect These)

### 1. Authentication & Security Contract
- **Tokens**: Signed JSON Web Tokens (JWT) containing `{ userId: string, email: string }`, expiring in 7 days.
- **Headers**: Client attaches `Authorization: Bearer <token>` via `client/src/lib/api.ts`.
- **Passwords**: Hashed with `bcryptjs` (salt rounds: 10). Plain text passwords must never be logged or stored.
- **Middleware**: `server/src/middleware/auth.ts` attaches `req.user: { id: string, email: string }` to authenticated requests and returns `401 Unauthorized` on missing/invalid tokens.

### 2. Project Data Model & Autosave Contract
- **Schema**: `server/src/models/Project.ts` stores:
  - `ownerId`: ObjectId referencing User (indexed).
  - `title`: string (default "Untitled").
  - `thumbnailUrl`: string optional.
  - `timeline`: Schema.Types.Mixed (validated against `TimelineSchema` from `server/src/schemas/timeline.ts`).
  - `version`: integer incremented on every save to prevent race conditions.
- **Autosave Timing**: Client debounces timeline modifications by **2000ms**. While a save is in flight, new edits queue up and trigger a subsequent sync upon completion.
- **Visual Feedback**: TopBar sync chip displays:
  - `Saved`: green dot `#34D399`
  - `Saving...`: pulsating amber dot `#D97706`
  - `Error saving`: red dot `#F87171` with retry button

### 3. Asset Cloud Storage Contract
- **Supported Formats**: Video (`mp4`, `webm`, `mov`), Audio (`wav`, `mp3`, `aac`), Images (`png`, `jpg`, `webp`).
- **File Limits**: Video max 150MB, Audio max 30MB, Images max 15MB.
- **Asset Model**: Stores `ownerId`, `projectId`, `url`, `duration`, `width`, `height`, `size`, `type`.

### 4. Client Export Engine Contract (`ffmpeg.wasm`)
- Runs in a detached `WebWorker` (`client/src/workers/exportWorker.ts`) to keep the main UI thread at 60fps.
- **Frame Render Loop**:
  - Sets renderer time to `t = frameIndex / fps`.
  - Captures raw RGBA pixel buffer from WebGL canvas (`gl.readPixels`).
  - Passes frame buffer to FFmpeg virtual filesystem (`ffmpeg.writeFile`).
- **Audio Mix Loop**:
  - Uses `OfflineAudioContext` to render composite audio graph matching timeline volume, clips, and trim times into a WAV buffer.
- **Mux & Encode**:
  - FFmpeg encodes video (`libx264`, preset `faster`, crf `22`) and audio (`aac`, 192k) into `output.mp4`.
  - Worker returns final Blob URL; triggers browser download.

### 5. Cloud Render Queue Contract (BullMQ + Redis)
- **Job Payload**: `{ projectId: string, userId: string, settings: { resolution: "1080p"|"4K", fps: 30|60, format: "mp4" } }`.
- **Status Enum**: `"queued" | "rendering" | "done" | "failed"`.
- **Polling / Updates**: Client polls `GET /api/render/:id` every 2s for progress percentage (0-100%).

---

## Definition of Done (Every Phase 5 Task)
- `npm run typecheck` passes with zero errors on both `client` and `server`.
- No memory leaks during video frame export (canvas buffers revoked each frame).
- Proper loading states, error boundaries, and empty states.
- Task box checked in `docs/TASKS.md`.


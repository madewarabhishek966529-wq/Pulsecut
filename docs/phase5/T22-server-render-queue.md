# T22: Server Render Queue with BullMQ & Redis

Read `docs/phase5/00-MASTER.md` and `docs/phase5/T21-export-mp4.md` first. This task is ONLY T22.

## Goal
Implement a background server-side render queue using BullMQ and Redis. For long-duration (e.g. >1 minute), high-resolution (4K), or high-fps exports that would strain client laptops, users can offload rendering to cloud worker jobs that track progress, render headless, and store the output file in cloud storage.

---

## Scope
- **IN**: Server BullMQ queue setup `server/src/queues/renderQueue.ts`, render worker `server/src/workers/renderWorker.ts`, `RenderJob` Mongoose model, REST endpoints `POST /api/render` and `GET /api/render/:id`, cloud render option in `client/src/components/ExportDialog.tsx`.
- **OUT**: Multi-machine distributed cluster orchestration (Phase 6).

---

## Dependencies
- Server: `bullmq`, `ioredis`, `@types/ioredis`. Redis connection string (`REDIS_URL`) configured in `server/.env`.

---

## Requirements

### 1. RenderJob Model: `server/src/models/RenderJob.ts`
```ts
import { Schema, model } from "mongoose";

const RenderJobSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    status: {
      type: String,
      enum: ["queued", "rendering", "done", "failed"],
      default: "queued",
    },
    progress: { type: Number, default: 0 },
    settings: {
      resolution: { type: String, default: "1080p" },
      fps: { type: Number, default: 30 },
      format: { type: String, default: "mp4" },
    },
    outputUrl: String,
    error: String,
  },
  { timestamps: true }
);

export const RenderJob = model("RenderJob", RenderJobSchema);
```

### 2. BullMQ Queue Setup: `server/src/queues/renderQueue.ts`
- Initializes `new Queue("video-render", { connection: redisClient })`.
- Exposes `addRenderJob(jobData)` which adds a job with exponential backoff retries.

### 3. Server Endpoints: `server/src/routes/render.ts`
- `POST /api/render`:
  - Authenticated via `auth` middleware.
  - Validates `projectId` and `settings`.
  - Creates `RenderJob` record in MongoDB with `status: "queued"`.
  - Pushes job to BullMQ queue.
  - Returns `202 Accepted` with `{ jobId: renderJob._id }`.
- `GET /api/render/:id`:
  - Returns current job status (`status`, `progress`, `outputUrl`, `error`).

### 4. Background Render Worker: `server/src/workers/renderWorker.ts`
- BullMQ worker listening to `"video-render"` queue.
- Updates job progress in Redis and MongoDB as rendering proceeds (`status: "rendering"`).
- Executes server render (using headless browser / canvas extraction + native `ffmpeg` binary).
- On completion:
  - Uploads generated `.mp4` to S3 / Object storage.
  - Updates `RenderJob` status to `"done"`, sets `outputUrl`, marks progress `100`.
- On error:
  - Logs failure, updates status to `"failed"`, records `error` message.

### 5. Client Option in `ExportDialog.tsx`
- Add a toggle or tab: "Device Export (ffmpeg.wasm)" vs "Cloud Render (Fast Server)".
- In Cloud mode:
  - Clicking "Start Export" calls `POST /api/render`.
  - Starts 2-second interval polling `GET /api/render/:id`.
  - Displays live cloud render progress bar.
  - When status is "done", displays "Download Video" link pointing to `outputUrl`.

---

## Edge Cases to Handle
- Redis disconnected: falls back to client-side `ffmpeg.wasm` export with user alert.
- Stalled jobs: configure BullMQ `stalledInterval` and lock duration to safely retry or fail hung render processes.
- Worker crash: cleanup partial files on disk in temporary directories.

---

## Acceptance Checklist
- [ ] Submitting a cloud render job enqueues a BullMQ task and creates a MongoDB `RenderJob` record.
- [ ] Worker processes the job and updates progress incrementally (0% -> 100%).
- [ ] Polling `GET /api/render/:id` reflects the actual progress in real time.
- [ ] Completed video is uploaded to storage and downloadable from `ExportDialog`.
- [ ] Graceful error reporting if rendering fails.


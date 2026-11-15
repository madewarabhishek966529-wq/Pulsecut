# T20: Asset Upload & Cloud Storage (S3 / Object Storage)

Read `docs/phase5/00-MASTER.md` and `docs/phase5/T19-projects-crud.md` first. This task is ONLY T20.

## Goal
Implement persistent media file uploads so imported videos, audio tracks, and images are stored in cloud object storage (AWS S3, Cloudflare R2, MinIO, or local disk in dev mode) rather than living solely as temporary browser `blob:` URLs.

---

## Scope
- **IN**: Server upload endpoint `POST /api/assets/upload`, `Asset` Mongoose model, S3 presigned URL or streaming multipart upload, client upload manager with percentage progress bar in `MediaPanel.tsx`, replacing temporary object URLs with persistent CDN/storage URLs.
- **OUT**: Transcoding or thumbnail generation queue (Phase 6).

---

## Dependencies
- Server: `multer`, `@types/multer`, `@aws-sdk/client-s3` (or local file storage fallback for development).

---

## Requirements

### 1. Asset Model: `server/src/models/Asset.ts`
```ts
import { Schema, model } from "mongoose";

const AssetSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    type: { type: String, enum: ["video", "audio", "image"], required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    duration: Number,
    width: Number,
    height: Number,
    size: Number,
  },
  { timestamps: true }
);

export const Asset = model("Asset", AssetSchema);
```

### 2. Storage Service: `server/src/services/storage.ts`
- Supports two modes:
  1. **S3 / R2 Mode**: If `S3_BUCKET` is configured, generates presigned PUT URLs or streams directly to S3.
  2. **Local Dev Mode**: If S3 credentials are unset, saves to `server/uploads/` directory and serves static files via `express.static("/uploads")`.
- Generates unique keys: `projects/${projectId}/${uuid}-${sanitizedFileName}`.

### 3. Server Routes: `server/src/routes/assets.ts`
- `POST /api/assets/upload`:
  - Receives `file` (multipart) and `projectId`.
  - Validates MIME type against whitelist (`video/mp4`, `video/webm`, `audio/wav`, `audio/mpeg`, `image/png`, `image/jpeg`).
  - Caps size at 150MB.
  - Uploads to storage, saves metadata in MongoDB `Asset` collection.
  - Returns `{ asset: AssetDocument }`.
- `GET /api/assets`:
  - Lists assets for `projectId` belonging to the user.

### 4. Client Integration: `components/editor/MediaPanel.tsx`
- While a file is uploading, render a progress bar on the asset card with percentage (0% to 100%).
- Once upload finishes, update the asset in `timelineStore` so `asset.url` points to the persistent storage URL.
- On project reload, assets are fetched and loaded seamlessly from storage.

---

## Edge Cases to Handle
- Upload interrupted / network drop: client shows retry button; deletes failed partial assets.
- Delete asset: removes document from MongoDB and deletes the file from storage bucket.
- CORS on storage: ensure S3/R2 bucket has CORS policy allowing `GET` with range requests from `http://localhost:5173`.

---

## Acceptance Checklist
- [ ] Uploading a video stores the binary file in storage and creates an asset document in MongoDB.
- [ ] Progress bar in `MediaPanel` updates smoothly during upload.
- [ ] Saved timeline references the persistent cloud/storage URL.
- [ ] Reopening the project in a new browser tab plays the video directly from the storage URL.
- [ ] Zero TypeScript errors.


# T19: Projects CRUD & Debounced Autosave Engine

Read `docs/phase5/00-MASTER.md` and `docs/phase5/T18-auth.md` first. This task is ONLY T19.

## Goal
Implement full project persistence and automatic cloud synchronization: server REST endpoints for project CRUD, client-side debounced autosave (2-second debounce on timeline changes) with status indicators, and connecting `DashboardView.tsx` to live MongoDB project records.

---

## Scope
- **IN**: Server routes `server/src/routes/projects.ts`, MongoDB `Project` model updates with timeline validation, client autosave hook `client/src/lib/useAutosave.ts`, sync status chip in `TopBar.tsx`, live project listing & creation in `DashboardView.tsx`.
- **OUT**: Asset binary uploads (T20), video exporting (T21).

---

## Dependencies
- Server: existing `mongoose`, `zod`, `express`.
- Client: `@tanstack/react-query` (already installed).

---

## Requirements

### 1. Server Routes: `server/src/routes/projects.ts`
All routes require authentication via `auth` middleware:
- `GET /api/projects`:
  - Returns array of projects owned by `req.user.id`, sorted by `updatedAt` descending.
  - Returns summary fields: `id`, `title`, `thumbnailUrl`, `updatedAt`, `duration`, `aspectRatio`.
- `POST /api/projects`:
  - Creates a new project for `req.user.id` with a blank timeline (`emptyTimeline()`) and default title `"Untitled Project"`.
  - Returns the newly created project document.
- `GET /api/projects/:id`:
  - Fetches project by ID, verifies `project.ownerId.toString() === req.user.id` (returns 403/404 if not owned).
  - Returns complete project including `timeline` JSON.
- `PUT /api/projects/:id`:
  - Validates request body: `{ title?: string, timeline?: Timeline, thumbnailUrl?: string }`.
  - Validates timeline structure with `TimelineSchema`.
  - Updates project and increments `version` field. Returns updated project.
- `DELETE /api/projects/:id`:
  - Deletes project owned by `req.user.id`.

### 2. Client Autosave Manager: `client/src/lib/useAutosave.ts`
- Listens to changes in `timelineStore.timeline` and project title.
- **Debounce**: 2000ms delay after the last edit before firing `PUT /api/projects/:id`.
- **Status States**:
  - `saved`: green dot, label "Saved"
  - `saving`: amber pulsating dot, label "Saving..."
  - `error`: red dot, label "Sync Error" with a retry button
- Updates the TopBar status chip accordingly.

### 3. Connect `DashboardView.tsx`
- Replace mock data array with a TanStack Query hook `useQuery({ queryKey: ["projects"], queryFn: fetchProjects })`.
- "New Project" button triggers `createProject` mutation, sets current project ID in store, and navigates to the Editor view.
- Project cards display actual project title, relative time (e.g. "Edited 5m ago"), duration, and a delete menu option.

---

## Edge Cases to Handle
- Navigating away while a save is in flight: trigger synchronous `navigator.sendBeacon` or immediate flush on `beforeunload`.
- Network disconnection: queue up changes in localStorage offline buffer; sync once online.
- Large timeline JSON: compress or strip redundant temporary UI properties before persisting.

---

## Acceptance Checklist
- [ ] User can create, list, rename, and delete projects.
- [ ] Editing timeline (e.g. trimming or moving a clip) triggers debounced autosave after 2 seconds.
- [ ] TopBar sync chip correctly displays "Saving..." then "Saved".
- [ ] Reloading the browser restores the exact timeline state from MongoDB.
- [ ] Zero TypeScript errors in `server/` and `client/`.


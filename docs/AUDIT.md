# Pulsecut: Comprehensive Pre-Production Audit (M0)
**Date:** November 15, 2026  
**Auditor:** Lead Engineering Agent  
**Status:** Complete — Awaiting Approval Before Milestone 1  

---

## 1. Executive Summary
Pulsecut currently possesses a solid architectural blueprint and a working foundational video player (T1 in `docs/phase2` is real: importing local video, PixiJS v8 canvas rendering, contain-fit scaling, and transport scrubbing work without errors).

However, **the vast majority of user-facing features beyond T1 are mockups, static HTML simulations, or stubbed placeholders**:
- **Authentication & Backend**: Completely unmounted in `server/src/app.ts` (only `/api/health` is active). The database connection is optional and not utilized by any live route.
- **Projects & Dashboard**: `DashboardView.tsx` displays 4 hardcoded mock projects with Unsplash thumbnail images; no projects CRUD or autosave exists.
- **Timeline & Editing**: `Timeline.tsx` renders static HTML clips (`Cyber_City_4K.mov`, `Synth_Car_Chase.mp4`) and a hardcoded SVG waveform. None of the track clips, drag handles, split/trim buttons, or playhead are connected to `timelineStore`.
- **Effects & Shaders**: `client/src/effects/registry.ts` is an empty stub. `LeftPanel.tsx` displays 6 hardcoded mock effects with external Unsplash images. `PulsecutRenderer` has no shader/filter pipeline attached yet.
- **AI Capabilities**: `PromptToFilterModal.tsx` simulates generation using a `setTimeout` of 1200ms. No server AI routes are implemented.
- **Export**: `ExportDialog.tsx` runs a simulated `setInterval` progress bar. No WebCodecs, `ffmpeg.wasm`, or BullMQ queue exists.

This audit provides the complete verified feature matrix, a forensic catalog of demo debris, an analysis of cross-feature technical risks, environment readiness, and a prioritized milestone roadmap to achieve a production-grade release.

---

## 2. Feature Matrix

Status Definitions:
- **REAL**: Fully functional against real code/APIs, no mock data, interactive in browser, handles edge cases.
- **PARTIAL**: Basic functional implementation exists, but lacks key capabilities, validation, or persistence.
- **MOCK**: UI simulates functionality via hardcoded mock arrays, fake timers (`setTimeout`/`setInterval`), or static graphics.
- **STUB**: Code signatures or files exist with empty maps, TODO comments, or no-op handlers.
- **MISSING**: Feature is not yet implemented in code or UI.

| Category | Feature | Status | Evidence (File & Behavior) | Effort |
|---|---|---|---|:---:|
| **Accounts & Projects** | Registration (Email/Password) | **MISSING** | `server/src/models/User.ts` exists, but no auth route in `server/src/app.ts`; no registration UI. | M |
| | Login & JWT Issuance | **MISSING** | No route, no middleware, no login form. TopBar displays static Unsplash avatar. | M |
| | Google OAuth Login | **MISSING** | Schema field `googleId` exists in `User.ts`, but no client button or token verification. | M |
| | Silent Token Refresh | **MISSING** | No refresh token mechanism or HTTP-only cookie handler. | S |
| | Logout & Account Menu | **MISSING** | Avatar in `TopBar.tsx:137` is non-interactive with no dropdown menu. | S |
| | Storage Quota & Enforcement | **MISSING** | No tracking of user storage volume or quota warnings. | M |
| | Delete Account & Data Export | **MISSING** | No GDPR/privacy data deletion or JSON archive endpoints. | M |
| | Dashboard: Project List | **MOCK** | `DashboardView.tsx:8` iterates `mockProjects` array with Unsplash images. | M |
| | Dashboard: Create / Rename / Delete | **MOCK** | Buttons exist in `DashboardView.tsx` but do not call any API or mutate state. | M |
| | Debounced Autosave | **MISSING** | TopBar has static sync chip (`Saved`); no network sync or debounce hook exists. | M |
| | Conflict Resolution & Offline Recovery | **MISSING** | No version check or localStorage disaster recovery. | L |
| | Missing-Media Relinking | **MISSING** | If an Object URL or file is lost, there is no relink dialog. | M |
| **Media Pipeline** | Video Import (File Picker) | **REAL** | `client/src/lib/mediaImport.ts` validates `video/*`, checks duration, extracts dimensions. | S |
| | Drag & Drop Media Import | **REAL** | `client/src/components/editor/MediaPanel.tsx:55` handles drop events and processes files. | S |
| | Audio File Import | **MISSING** | `mediaImport.ts:6` explicitly rejects non-video MIME types. | S |
| | Image File Import | **MISSING** | No image asset handling or image clip renderer in PixiJS. | M |
| | Cloud Upload (S3/R2/Storage) | **MISSING** | Assets stay as temporary `blob:` URLs in browser memory; no backend upload route. | M |
| | Upload Progress / Retry / Resume | **MISSING** | No upload chunking or progress tracking. | M |
| | Remote Playback & CORS Handling | **MISSING** | `renderer.ts` sets `crossOrigin not needed for object URLs`; remote URLs will fail CORS. | S |
| | Media Library Panel | **PARTIAL** | `MediaPanel.tsx` lists imported project assets and can delete them; lacks search/filters. | S |
| | Delete Asset with Cleanup | **REAL** | `timelineStore.ts:117` removes clips, cleans state, and calls `URL.revokeObjectURL`. | S |
| **Editor Core** | Multi-Track Timeline Data Model | **REAL** | `types/timeline.ts` defines `TimelineSchema` with tracks (`video`, `audio`, `text`) and clips. | S |
| | Multi-Track Timeline UI | **MOCK** | `Timeline.tsx:90-176` renders hardcoded DOM elements with static clip titles. | L |
| | Timeline Zoom, Scroll & Ruler | **MOCK** | Zoom slider updates local state only; ruler has static hardcoded timestamps `00:00` to `00:12`. | M |
| | Playhead Scrubbing | **PARTIAL** | `Transport.tsx` scrubs seek bar; `Timeline.tsx:78` playhead position is hardcoded at 35%. | M |
| | Clip Selection & Multi-Select | **MISSING** | Clips cannot be clicked or selected on the timeline canvas. | M |
| | Clip Drag / Move Across Tracks | **MISSING** | No drag handlers or drop targets between tracks. | L |
| | Clip Trim (In / Out Handles) | **MOCK** | Handles in `Timeline.tsx:100` are purely decorative CSS divs with no mouse drag logic. | M |
| | Split Clip at Playhead (`S`) | **MOCK** | Button in `Timeline.tsx:18` exists but has no click listener or keydown binding. | S |
| | Ripple Delete & Standard Delete | **MOCK** | Delete button in `Timeline.tsx:22` has no handler. | S |
| | Timeline Snapping & Beat Snap | **MOCK** | Button in `Timeline.tsx:30` toggles local text label only; no snapping math implemented. | M |
| | Undo / Redo History | **STUB** | Buttons in `TopBar.tsx:89-102` have no click handlers; `timelineStore.ts` has no undo stack. | M |
| | Keyboard Shortcuts & Cheat Sheet | **PARTIAL** | `Transport.tsx` handles Spacebar; all other shortcuts and cheat sheet (`?`) are missing. | S |
| | Transport (Play/Pause, Frame Step) | **REAL** | `Transport.tsx` controls play/pause, steps single frames forward/backward, loops at end. | S |
| | Aspect Ratio Scaling (Contain) | **REAL** | `renderer.ts:213` dynamically computes contain-fit letterboxing on window resize. | S |
| | Project Aspect Ratio Switcher | **MOCK** | `TopBar.tsx:106` changes local dropdown state only; does not update `project.width/height`. | S |
| **Direct Manipulation** | On-Canvas Move / Scale / Rotate Gizmo | **MISSING** | No interactive transform handles over the video preview. | L |
| | Snap Alignment Guides | **MISSING** | No visual crosshairs or snapping guides on canvas. | M |
| | Numeric Inspector | **MOCK** | `Inspector.tsx:4-14` uses local React state; does not read from or update selected clip. | M |
| | Video Opacity & Audio Fade In/Out | **MISSING** | No fade handles or interpolation curves on clips. | M |
| | Clip Volume Control | **MISSING** | `ClipSchema` in `types/timeline.ts` has no volume field; no audio attenuation logic. | S |
| **Audio Engine** | Multi-Track Audio Playback | **MISSING** | Video audio plays through browser element; no Web Audio graph for multi-track audio. | L |
| | Waveform Visualization | **MOCK** | `Timeline.tsx:155` uses a hardcoded SVG `<path>` bezier curve for all audio. | M |
| | Audio VU Level Meter | **MOCK** | `PreviewStage.tsx:109` has hardcoded width percentages (`w-[75%]`, `w-[10%]`) for VU meter. | S |
| | Beat Analysis & BPM Detection | **MOCK** | `Timeline.tsx:165` places static pins at `[25, 45, 70, 85]`; no audio FFT or peak detection. | M |
| **Effects Engine** | Effect Registry | **STUB** | `client/src/effects/registry.ts` is an empty `Map` with a `TODO` comment. | S |
| | Effect Browsing & Search | **MOCK** | `LeftPanel.tsx:10` displays 6 hardcoded mock effects using Unsplash photography. | S |
| | Drag Effect onto Clip | **MOCK** | Cards display text "Drag to clip", but `draggable` attributes and drop targets are missing. | M |
| | Shader Execution Pipeline | **MISSING** | `PulsecutRenderer` renders raw sprites; PixiJS filter passes are not implemented. | L |
| | Effect Parameter Sliders | **MOCK** | `Inspector.tsx:11` has hardcoded sliders for "Glitch Intensity" and "VHS Grain". | M |
| | Keyframes for Parameters | **MISSING** | Schema supports `KeyframeSchema`, but no UI or runtime interpolation exists. | L |
| | Clip Transitions | **MISSING** | No transition shaders (`uProgress`) between consecutive clips on track. | M |
| | Audio-Reactive Uniform Bindings | **MOCK** | Toggle in `Inspector.tsx:13` toggles local boolean; no Web Audio connection exists. | M |
| **AI Features** | Prompt-to-Filter Generation | **MOCK** | `PromptToFilterModal.tsx:28` runs a 1.2s `setTimeout` and updates local state. | L |
| | Server Gemini Route & Zod Schema | **MISSING** | `server/src/routes/ai.ts` not created; no Gemini SDK integration. | M |
| | Client Shader Compile & Auto-Fix | **MISSING** | No headless WebGL compiler or retry loop. | M |
| | Edit by Chat | **MISSING** | No chat route, no patch executor, no ChatPanel UI component. | L |
| | Auto-Captions (Whisper / Speech) | **MISSING** | No transcription service, no subtitle generation on text track. | L |
| **Text System** | Text Clip Rendering on Canvas | **MISSING** | `PulsecutRenderer` only processes video track clips; text track clips are ignored. | M |
| | Text Presets & Typography | **MOCK** | `LeftPanel.tsx:190` lists 3 mock preset titles with no click actions. | S |
| | Self-Hosted Fonts & Devanagari | **PARTIAL** | Google Fonts linked in `index.html`; self-hosted woff2 files not in `public/content/`. | S |
| | On-Canvas Text Editing | **MISSING** | No double-click text editing or direct text canvas interaction. | M |
| **Export System** | In-Browser MP4 Export | **MOCK** | `ExportDialog.tsx:19` runs fake `setInterval` incrementing progress by 15%. | L |
| | `ffmpeg.wasm` & Web Worker | **MISSING** | No export worker, no frame buffer extraction from PixiJS. | L |
| | Server Render Queue (BullMQ) | **MISSING** | No BullMQ queue, no Redis integration, no render worker. | L |
| **Platform & Production** | Environment Configuration | **PARTIAL** | `server/src/config/env.ts` parses basic vars; missing Redis, Cloudinary/S3, Groq. | S |
| | Health Checks (`/api/health`) | **REAL** | `server/src/routes/health.ts` responds with `{ ok: true }`; TopBar displays status badge. | S |
| | Production Build Validation | **REAL** | `npm run build --prefix client` compiles Vite bundle cleanly without type errors. | S |
| | Security Headers & CSP | **PARTIAL** | Helmet enabled in `server/src/app.ts:10`; no strict CSP, CORS is generic. | S |
| | Error Tracking & Logging | **MISSING** | No Sentry integration; server logs using raw `console.error`. | S |
| **Product & Onboarding** | Landing Page | **MOCK** | `LandingPageView.tsx` has static copy and Unsplash mock product screenshot. | S |
| | Interactive Tour & Onboarding | **MISSING** | No first-run onboarding tour or sample project auto-loader. | S |
| | Legal Pages (Terms / Privacy) | **MISSING** | No Terms of Service, Privacy Policy, or Cookie notice. | S |
| | Help / Keyboard Cheat Sheet | **MISSING** | No `?` dialog or feedback form. | S |

---

## 3. Demo Debris Inventory

Every piece of demo debris currently in the project has been cataloged and classified:

### A. Simulated Timers & Mock State (Must Implement or Replace)
1. **`client/src/components/ExportDialog.tsx` (Lines 19-28)**:
   - `setInterval` simulating export progress `prev + 15` every 300ms.
   - *Action:* Replace with real `ffmpeg.wasm` / WebCodecs export worker (M4/M2).
2. **`client/src/components/PromptToFilterModal.tsx` (Lines 28-33)**:
   - `setTimeout` simulating AI filter synthesis in 1200ms.
   - *Action:* Replace with real server Gemini API call (M4).
3. **`client/src/components/DashboardView.tsx` (Lines 8-45)**:
   - `mockProjects` array with hardcoded IDs, titles, and edit dates.
   - *Action:* Replace with live MongoDB queries via TanStack Query (M2).
4. **`client/src/components/LeftPanel.tsx` (Lines 10-47, 190-215)**:
   - `mockEffects` array with static Unsplash image URLs and mock badges.
   - Mock preset titles and static beat markers text (`"14 Beat markers detected"`).
   - *Action:* Replace with real declarative built-in content registry (M3).
5. **`client/src/components/Timeline.tsx` (Lines 98-174)**:
   - Hardcoded clip divs (`Cyber_City_4K.mov`, `Synth_Car_Chase.mp4`, `Cyborg_Portrait.mov`).
   - Hardcoded text clip (`NEON BEAT DROP`).
   - Hardcoded SVG waveform `<path>` and beat pins `[25, 45, 70, 85]`.
   - *Action:* Replace with dynamic timeline renderer reading from `timelineStore.tracks` (M2).
6. **`client/src/components/Inspector.tsx` (Lines 4-14)**:
   - Unconnected local state variables (`posX`, `posY`, `scale`, `rotation`, `glitchIntensity`, `vhsGrain`).
   - *Action:* Wire to selected clip transform and active effect parameters (M2).

### B. External Unsplash Placeholders (Must Remove / Self-Host Original Assets)
1. `client/src/components/DashboardView.tsx` (Lines 15, 24, 33, 42, 94): 5 Unsplash URLs.
2. `client/src/components/ExportDialog.tsx` (Line 73): 1 Unsplash URL.
3. `client/src/components/LandingPageView.tsx` (Line 49): 1 Unsplash URL for fake editor screenshot.
4. `client/src/components/LeftPanel.tsx` (Lines 14, 20, 26, 32, 38, 44): 6 Unsplash URLs for effect cards.
5. `client/src/components/TopBar.tsx` (Line 153): 1 Unsplash URL for mock user avatar.
*Action:* Replace with self-hosted SVGs, dynamically generated runtime canvas thumbnails, and original sample media (M1/M3).

### C. Stubbed Code & TODO Comments
1. `server/src/app.ts:15`: `// TODO: auth, projects, assets, ai, effects, render routers` -> Implement routers (M1/M2).
2. `client/src/effects/registry.ts:4`: `// TODO (T7/T8): add glitch, rgbSplit, vhs, zoomPulse, blur` -> Implement built-in effects (M3).
3. `client/src/store/timelineStore.ts:19`: `// TODO (T2): add full clip operations and undo/redo history` -> Implement timelineOps & undo/redo (M2).
4. `client/src/lib/renderer.ts:245`: `// TODO(T5): replaced by PlaybackController` -> Refactor in M2.
5. `client/src/components/editor/PreviewCanvas.tsx:84`: `// TODO(T5): replaced by PlaybackController` -> Refactor in M2.

### D. Dev-Only Triggers (Must Gate to Development Mode)
1. `client/src/components/editor/MediaPanel.tsx:69-77`: `"Load Sample Video (Dev)"` button.
   - *Action:* Gate behind `import.meta.env.DEV` or integrate into first-run onboarding (M1/M7).
2. Raw `console.log` / `console.warn` occurrences in `renderer.ts`, `PreviewCanvas.tsx`, `MediaPanel.tsx`, and `server/src/index.ts`:
   - *Action:* Replace with a unified client/server structured logger (M1/M6).

---

## 4. Cross-Feature Integration Risks & Spikes

1. **Shader & WebCodecs Export Parity (High Risk - Spike Needed)**:
   - PixiJS v8 filters execute on GPU via WebGL/WebGPU. During client-side export via `ffmpeg.wasm` or WebCodecs, frames must be stepped synchronously, rendered offscreen at target resolution (e.g. 1080x1920), and captured without dropping custom uniforms (`uTime`, `uProgress`, `uBeat`).
   - *Mitigation:* Create a dedicated offscreen export renderer harness in M2 that renders exact frames without relying on browser requestAnimationFrame.
2. **Audio/Video Sync on Trimmed & Speed-Modified Clips (Medium Risk)**:
   - When clips have non-zero `sourceIn` and differing start times on the timeline, maintaining sub-millisecond audio alignment with Web Audio API during scrubbing and playback is prone to drift.
   - *Mitigation:* Single master audio clock driving video frame presentation; lock video elements to audio context time.
3. **Autosave vs. Interactive Drag Operations (Medium Risk)**:
   - If an autosave triggers in the middle of a continuous slider scrub or clip drag, it may serialize an intermediate state or trigger unnecessary server load.
   - *Mitigation:* Implement debounced autosave (2000ms idle) and pause sync while mouse drag gestures are active.
4. **AI-Generated GLSL Shader Compilation Failures (High Risk)**:
   - LLMs can output invalid GLSL (WebGL 2.0 syntax, precision errors, missing uniforms).
   - *Mitigation:* Headless offscreen WebGL compile check with an automated fix loop (`POST /api/ai/filter/fix`, max 3 attempts) before applying to any timeline clip.
5. **Remote Asset CORS & Byte-Range Requests (Medium Risk)**:
   - Videos loaded from cloud storage (S3/R2) require proper `Access-Control-Allow-Origin` and `Accept-Ranges: bytes` headers to allow PixiJS texture uploads and canvas scrubbing.
   - *Mitigation:* Configure proper CORS headers in storage buckets and enable `crossOrigin = "anonymous"` on all video source elements.

---

## 5. Environment & Infrastructure Readiness

| Service / Variable | Required For | Current Status | Action Needed |
|---|---|---|---|
| `NODE_ENV` / `APP_ENV` | Environment switching | Missing | Add to `server/.env` and `client/.env` (`development`, `production`). |
| `PORT` | API Server port | Configured (`4000`) | Ready. |
| `CLIENT_ORIGIN` | CORS whitelist | Configured (`http://localhost:5173`) | Ready. |
| `JWT_SECRET` | Auth token signing | Configured (`dev-secret`) | Production requires strong 256-bit secret. |
| `MONGODB_URI` | User & project persistence | Configured (local fallback) | Production requires MongoDB Atlas cluster URI. |
| `GEMINI_API_KEY` | Prompt-to-Filter & Chat | Configured in `server/.env` | Ready for live Gemini API calls. |
| `GROQ_API_KEY` | Whisper speech transcription | Missing | Need Groq API key in `server/.env` for captions. |
| `S3_BUCKET` / Storage | Cloud asset persistence | Missing | Configure S3/R2 bucket or local dev storage fallback. |
| `REDIS_URL` | BullMQ server render queue | Missing | Optional: flag off in dev, require in cloud worker deployment. |
| `SENTRY_DSN` | Observability & error logs | Missing | Add Sentry DSN for client & server crash reporting. |

---

## 6. Milestone Plan & Backlog

```
M0: Comprehensive Audit (Current Step — Complete)
 │
 ├── M1: Remove Demo & Establish Honesty (Boot validation, mode flags, debris cleanup)
 │
 ├── M2: Complete Missing Core Features (Real timeline UI, clip ops, undo/redo, gizmo, project settings)
 │
 ├── M3: Built-in Content System (36 shaders, 12 transitions, 12 text presets, audio loops & SFX)
 │
 ├── M4: Integration & E2E Proof (Playwright test suite, real Gemini/Groq, real media export)
 │
 ├── M5: Performance, Reliability & Compatibility (60fps benchmark, memory audit, browser matrix)
 │
 ├── M6: Security, Legal, Cost Control & Observability (CSP, rate limits, Terms/Privacy, Sentry)
 │
 ├── M7: Onboarding & Product Polish (Interactive tour, real landing page, shortcuts dialog)
 │
 └── M8: Production Release (Documentation, release checklist, v1.0.0 tag)
```

### The Strict Cut Line (If Time Runs Short)
If time or resource constraints arise, execution will strictly follow the cut line in order:
1. **M0 & M1**: Honest production foundation, zero fake mocks.
2. **M2 Core**: Items 1 (image clips), 2 (on-canvas gizmo), 3 (fades), 8 (shortcuts), 10 (account deletion), 11 (error boundaries).
3. **M3 Content Minimal**: 20 core effects, 6 transitions, 6 text presets, 8 fonts, 10 stickers, 4 loops + 10 SFX, 4 templates.
4. **M4 Journeys**: E2E tests 1 (edit & autosave), 2 (cloud load), 3 (Prompt-to-Filter), 5 (captions), 8 (browser export).
5. **M6 & M8**: Security, legal pages, quotas, documentation.
*Lower priority items (complex server render queue clustering, 40+ stickers, clip speed pitch-correction) will be placed in `docs/KNOWN-LIMITATIONS.md`.*

---

## 7. Approval Gate

> [!IMPORTANT]
> **Audit Status**: M0 is complete. No feature code has been modified in this milestone.
> 
> Awaiting user review and approval of `docs/AUDIT.md` before starting **Milestone 1 (Remove the Demo & Make Production Honest)**.


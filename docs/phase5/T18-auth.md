# T18: User Authentication & Protected Routes (Email, Password, Google, JWT)

Read `docs/phase5/00-MASTER.md` first. This task is ONLY T18.

## Goal
Implement full user authentication on both server and client: email/password registration with bcrypt password hashing, login, Google OAuth verification, JWT issuance, authentication middleware for protected API endpoints, and a client-side session store with a clean modal.

---

## Scope
- **IN**: Server routes `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `GET /api/auth/me`, JWT verification middleware `server/src/middleware/auth.ts`, client Zustand store `client/src/store/authStore.ts`, auto-attaching tokens in `client/src/lib/api.ts`, and `AuthModal.tsx`.
- **OUT**: Projects persistence (T19), asset uploads (T20).

---

## Dependencies
- Server: `bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`, `google-auth-library`.

---

## Requirements

### 1. Zod Schemas: `server/src/schemas/auth.ts`
```ts
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(50),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const GoogleAuthSchema = z.object({
  idToken: z.string().min(10),
});
```

### 2. Auth Middleware: `server/src/middleware/auth.ts`
Extracts `Authorization: Bearer <token>` header:
- Verifies JWT against `env.JWT_SECRET`.
- If valid, attaches user payload to `req.user: { id: string; email: string }`.
- If missing or invalid, returns `401 Unauthorized` with `{ error: "Authentication required" }`.

### 3. Server Routes: `server/src/routes/auth.ts`
- `POST /api/auth/register`:
  - Validates body against `RegisterSchema`.
  - Checks if user with email already exists (returns 409 if exists).
  - Hashes password with `bcryptjs.hash(password, 10)`.
  - Creates user in MongoDB, generates JWT token, returns `{ token, user: { id, email, name } }`.
- `POST /api/auth/login`:
  - Validates email and password against stored `passwordHash`.
  - Returns `{ token, user }` or 401 on incorrect credentials.
- `POST /api/auth/google`:
  - Verifies token with `OAuth2Client.verifyIdToken`.
  - Upserts user in MongoDB with `googleId`, returns `{ token, user }`.
- `GET /api/auth/me`:
  - Protected with `auth` middleware; returns current authenticated user profile.

### 4. Client Auth Store: `client/src/store/authStore.ts`
- Manages `token`, `user`, `isAuthenticated`, `login`, `register`, `logout`.
- Persists `token` in `localStorage` under `pulsecut_token`.
- On app launch, calls `GET /api/auth/me` to hydrate session.
- Automatically injects `Authorization: Bearer <token>` into `client/src/lib/api.ts`.

### 5. Client Auth Modal: `components/auth/AuthModal.tsx`
- Dialog matching dark glass theme (`#121318` + `#E05A2B` accent).
- Tabs: "Sign In" and "Create Account".
- Input fields with error messages (email, password, name).
- "Continue with Google" button.
- Replaces avatar / sign in button in [`TopBar.tsx`](file:///c:/Users/madew/Desktop/Git%20Project/MERN%20Project/Pulsecut/client/src/components/TopBar.tsx).

---

## Edge Cases to Handle
- Token expiration: client intercepts 401 response and clears user session gracefully without app crash.
- Duplicate email on register: clear user feedback `"An account with this email already exists"`.
- Rate limiting: protect `/api/auth/login` from brute force (express-rate-limit).

---

## Acceptance Checklist
- [ ] Registering a new account creates a user with hashed password in MongoDB and returns a JWT.
- [ ] Logging in with correct credentials returns valid JWT and user info.
- [ ] Accessing protected endpoints without token returns 401.
- [ ] Client remembers logged-in session across page reloads.
- [ ] Logging out clears state and resets UI back to guest state.
- [ ] Zero TypeScript errors in `server/` and `client/`.


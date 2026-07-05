# kpopschool — portfolio demo

A from-scratch, modern-stack rewrite of a K-pop dance/vocal lesson booking
platform (teachers, curriculums, bookings, payments, live classes, a
community board, and an admin dashboard), built as a safe-to-demo portfolio
piece. Full spec/plan/tasks live one level up (this repo is a sibling of the
original `kpop_server`/`kpopschool`, under a shared `docs/` — see the
[design doc's rationale](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/plan.md)):
[`../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/`](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/spec.md).

## Why a rewrite, not a refactor

The original two repositories this project is based on had a Firebase
service-account private key committed to git history, a hardcoded Stripe key
and Gmail app password in source, an unauthenticated endpoint that could wipe
the entire database via `GET`, and literally zero authentication on any API
route (full detail: [`research.md`](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/research.md);
remediation checklist for the *original* repos: [`SECURITY-ADVISORY.md`](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/SECURITY-ADVISORY.md)).
Rather than inherit that history, this is a new codebase with a clean git
history, TypeScript throughout, and an actual auth/authorization layer.

## Architecture

```
apps/
├── web/      Vite + React 18 + TypeScript + Chakra UI (SPA)
└── server/   NestJS + TypeScript (REST API over Firestore)
packages/
└── shared-types/   Domain types shared by both apps
```

**Integration adapter pattern** (the core design decision): Stripe and Zoom
are each behind an interface with two implementations — a real one that
calls the actual SDK, and a mock one that doesn't. One environment variable,
`INTEGRATION_MODE` (`demo` | `real`), picks which gets wired up via NestJS
dependency injection. The public demo deployment always runs `demo`; `real`
exists so a developer can prove the integration code actually works, using
Stripe test-mode keys, without ever putting that mode in front of the public
internet. Firestore/Firebase Auth are always "real" (against a demo-only
Firebase project) — there's no good way to fake a database for a CRUD-heavy
demo, and Firebase Auth is free at this scale anyway.

## Getting started

Two ways to get a working backend: a real (free-tier) Firebase project, or
the Firebase Local Emulator Suite (no account needed, what this repo's own
verification runs use).

```bash
pnpm install

cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

**Option A — local emulator (fastest, no Firebase account):** set
`FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` in `apps/server/.env`
and `VITE_USE_FIREBASE_EMULATOR=true` in `apps/web/.env` (both already show
this, commented, with the ports `firebase.json` uses — 18085/19099, chosen to
avoid colliding with any other Firebase emulator you might have running for
an unrelated project). Then:

```bash
pnpm run emulators   # separate terminal — Firebase Local Emulator Suite
pnpm --filter server run seed
pnpm --filter server run create-admin you@example.com   # optional, for /admin
pnpm run dev          # apps/web (5173) + apps/server (8090)
```

**Option B — real Firebase project:** create a new project dedicated to this
demo, fill in real credentials in both `.env` files, leave the emulator env
vars unset, then run the same `seed` / `create-admin` / `dev` commands.

Visit `http://localhost:5173` and click **"Try the demo"** to sign in
without creating an account, or sign up normally.

## Testing

```bash
pnpm run typecheck   # tsc --noEmit across all 3 packages
pnpm run test        # jest (server) + vitest (web)
pnpm run build       # production builds
bash scripts/scan-secrets.sh   # fails if a known-leaked-credential shape shows up

# Full E2E suite (Playwright) — requires the emulator + both dev servers up
# (see Getting started). Resets and reseeds demo data before every run
# (e2e/global-setup.ts), so it's safe to run repeatedly:
E2E_ADMIN_EMAIL=you@example.com E2E_ADMIN_PASSWORD=yourpassword \
  pnpm --filter web run test:e2e
```

## Deployment

`apps/server/Dockerfile` builds a production image (verified locally with
`docker build`); any Docker-friendly host works (Fly.io, Render, Railway,
Cloudtype). `apps/web` builds to a static `dist/` (Netlify `_redirects`
included; any static host works). Set `INTEGRATION_MODE=demo` on whatever
platform you deploy to — it's the default, but deployments should pin it
explicitly rather than rely on an unset env var.

**Known gaps, disclosed rather than hidden:**
- Lighthouse Performance/Accessibility targets (spec.md NFR-004/005) are
  aspirational — they haven't been measured against a live deployment yet.
- Zoom domain verification (`apps/web/public/Zoomverify/verifyzoom.html`) is
  a placeholder until a real Zoom app + deployed domain exist.
- The Playwright E2E suite (`apps/web/e2e/`) has been run repeatedly against
  the local emulator stack (8/8 passing) — see CHANGES.md for the real bugs
  that surfaced only under actual execution (undefined-field Firestore
  writes, eager Stripe client construction, a missing post-login redirect,
  div-onClick cards with no accessible name). It has not been run against a
  real Firebase project or wired into CI.

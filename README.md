# K-POP School — portfolio demo

A from-scratch, modern-stack rewrite of a K-pop dance/vocal lesson booking
platform: teachers, curriculums, bookings, payments, live classes, video
lessons with quizzes and certificates, per-lesson discussion, and an admin
dashboard with a reporting tab — built as a safe-to-demo portfolio piece.

[![CI](https://github.com/iamdeez/kpopschool-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/iamdeez/kpopschool-portfolio/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Fly.io](https://img.shields.io/badge/Fly.io-8B5CF6?logo=flydotio&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)

**🔗 Live demo:** **https://kpopschool-portfolio-demo.netlify.app**
— click **"Try the demo"** to sign in with zero setup, or sign up for a
real account. Demo login, real signup/signin, and admin login are all
verified end-to-end against this exact deployment (not just localhost).

<p>
  <img src="docs-assets/screenshot-home.webp" alt="Home page" width="100%">
</p>
<p float="left">
  <img src="docs-assets/screenshot-teachers.webp" alt="Teachers page" width="49%">
  <img src="docs-assets/screenshot-curriculum.webp" alt="Curriculum page" width="49%">
</p>

## Table of contents

- [Why a rewrite, not a refactor](#why-a-rewrite-not-a-refactor)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known gaps](#known-gaps-disclosed-rather-than-hidden)

Full spec/plan/tasks live one level up (this repo is a sibling of the
original `kpop_server`/`kpopschool`, under a shared `docs/`):

- [`v1.0.0/001-kpopschool-portfolio-renewal/`](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/spec.md) — the initial rewrite (see the [design doc's rationale](../docs/specs/v1.0.0/001-kpopschool-portfolio-renewal/plan.md))
- [`v1.1.0/001-lesson-progress-tracking/`](../docs/specs/v1.1.0/001-lesson-progress-tracking/spec.md) — per-lesson video structure + progress tracking
- [`v1.2.0/001-lesson-quiz-certificate/`](../docs/specs/v1.2.0/001-lesson-quiz-certificate/spec.md), [`002-admin-reporting-dashboard/`](../docs/specs/v1.2.0/002-admin-reporting-dashboard/spec.md), [`003-lesson-discussion-board/`](../docs/specs/v1.2.0/003-lesson-discussion-board/spec.md) — quizzes/certificates, admin reporting, and a per-lesson discussion board

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

Server-side domain modules: `teacher`, `curriculum` (lessons + optional per-lesson
quizzes embedded on each curriculum), `event`, `faq`, `review`, `inquiry` (private
1:1 support), `comment` (public per-lesson discussion), `user`, `payment`
(Stripe/mock adapter), `video-class` (Zoom/mock adapter), `progress` (per-user
lesson completion, quiz grading, certificate eligibility), `reporting`
(admin-only aggregate stats), `demo` (frictionless demo login), `auth`.

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

| Check | Coverage |
|---|---|
| `pnpm run typecheck` | `tsc --noEmit` across all 3 packages |
| `pnpm --filter server run test` | 35 Jest specs (services, guards, mock gateways) |
| `pnpm --filter web run test` | Vitest (route guards) |
| `pnpm --filter web run test:e2e` | 13 Playwright specs — real emulator, real backend, real frontend |
| CI (`.github/workflows/ci.yml`) | Both of the above, on every push, against a real Firebase emulator |

## Deployment

`apps/server/Dockerfile` builds a production image; deployed to **Fly.io**
(`apps/server/fly.toml`, Tokyo region) at https://kpopschool-portfolio-server.fly.dev.
`apps/web` builds to a static `dist/` (Netlify `_redirects` included);
deployed to **Netlify** at https://kpopschool-portfolio-demo.netlify.app.
Both point at a real Firebase project (`kpopschool-portfolio-demo`, Firestore
Native mode). `INTEGRATION_MODE=demo` is set explicitly as a Fly.io secret
(it's also the code's default, but deployments should pin it rather than
rely on an unset env var). Fly.io's `auto_stop_machines` is on (machines
fully stop when idle, restart on the next request) to stay within the free
tier — the trade-off is a cold-start delay on the first request after a
period of no traffic.

## Known gaps, disclosed rather than hidden

<details>
<summary><b>Lighthouse (mobile), measured against the real live deployment</b> — Accessibility 99–100, Performance 79–82</summary>

<br>

Accessibility stays effectively perfect (Home 99, Teachers 100,
Curriculum 100 — same as the local-build measurement). **Performance
moved in both directions**: Home 78 → **82** (improved), but Teachers
85 → 79 and Curriculum 93 → 79 (both **regressed**, Curriculum losing its
90+ pass). Root cause (confirmed via Lighthouse's network-requests audit):
a real Firebase project makes a `www.googleapis.com/identitytoolkit/.../getProjectConfig`
call on Auth init that the Local Emulator Suite never makes at all — so
every prior "local build" measurement was quietly optimistic. Teachers/
Curriculum had few other third-party requests, so this new call is a large
relative hit; Home already had many, so the CDN's benefit outweighed it.
See `docs/specs/v1.0.0/CHANGES.md` for the full breakdown. This is now
believed to be the final, honest number for this stack — further gains
would need bypassing Firebase Auth's own init behavior.

</details>

<details>
<summary><b>Auth flows</b> — demo login, real signup/signin, and admin login all verified against the live deployment</summary>

<br>

Verified end-to-end via curl against the real Firebase Auth REST API: real
registration → sign-in → real ID token → authenticated backend calls
(a purchase, progress tracking, and an admin-only reports call). The
temporary test account created for this check was deleted afterward.

</details>

<details>
<summary><b>Fly.io cold start</b> — first request after idle pays a boot-time delay</summary>

<br>

`auto_stop_machines` is on to stay within the free tier (machines fully
stop when idle, restart on the next request) — a deliberate trade-off for
a low-traffic portfolio demo over paying for an always-on machine.

</details>

<details>
<summary><b>Zoom domain verification</b> — placeholder until a real Zoom app exists</summary>

<br>

`apps/web/public/Zoomverify/verifyzoom.html` is a placeholder until a real
Zoom app + deployed domain exist.

</details>

<details>
<summary><b>E2E suite</b> — 13/13 locally and in CI; real bugs found along the way, not just typos</summary>

<br>

The Playwright E2E suite (`apps/web/e2e/`) passes 13/13 both locally and in
CI (`.github/workflows/ci.yml`'s `e2e` job, verified against the actual
GitHub Actions run at https://github.com/iamdeez/kpopschool-portfolio) —
see `docs/specs/v1.0.0/CHANGES.md`, `docs/specs/v1.1.0/CHANGES.md`,
`docs/specs/v1.2.0/CHANGES.md`, and `docs/specs/v1.2.1/CHANGES.md` for real
bugs (not just typos) that only surfaced under actual execution — a
`class-transformer`/Firestore serialization conflict, an admin "list all
payments" query that had silently returned an empty array since v1.0.0, and
four CI-only failures (pnpm/action-setup version conflict, a JDK version
too old for firebase-tools, a missing shared-types build step, and a
Vite dev-server IPv4/IPv6 binding mismatch, and — found deploying to
Fly.io — a NestJS server binding IPv6-only by default, unreachable by
Fly.io's IPv4 health-checking proxy). The automated suite itself still
only runs against the emulator; the core customer flow (demo login → buy
→ progress) was separately verified against the real deployment above via
direct API calls, not the Playwright suite.

</details>

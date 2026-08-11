# خضارك (Khodarak)

Fresh produce subscription — Next.js App Router + TypeScript + Supabase + Moyasar, RTL-first.

A complete customer-facing app (browse, subscribe, pay, manage a subscription), a full
payment/renewal/dunning engine, and an admin panel, built across 9 phases per [plan.md](./plan.md)
— see `specs/001-phase-0-foundation` through `specs/010-phase-9-hardening-launch` for the full
spec/plan/task history of every phase.

## Getting started (local development)

```bash
cp .env.example .env.local   # fill in your Supabase project's URL + keys, and TEST-mode Moyasar keys
npm install
npm run dev
```

Visit `http://localhost:3000`. Check `http://localhost:3000/api/health` to confirm the app can
reach your configured Supabase project. Local development never runs against Docker or live
Moyasar credentials — see below for both.

## Verifying before you push

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

This is the exact sequence `.github/workflows/ci.yml`'s `verify` job runs on every push/PR; a
failing step here will fail CI and block deployment (see below).

## Docker

The `Dockerfile` is a multi-stage build producing a Next.js `standalone` image; `docker-compose.yml`
runs it locally against the same env vars as `npm run dev`.

```bash
docker compose build
docker compose up
```

The container exposes `GET /api/health` as its `HEALTHCHECK` target. Build-time-only env vars
(everything under `NEXT_PUBLIC_*` plus the server secrets `lib/env.server.ts` validates) have
placeholder values baked into the `Dockerfile`'s builder stage so the image can build in CI without
real secrets; the real values are supplied at container **runtime** via `.env.production` (see
`.env.production.example`), never baked into the image.

## CI / Deploy / Rollback

`.github/workflows/ci.yml` has two jobs:

- **`verify`** (every push/PR): `npm ci` → lint → typecheck → `test:unit` → `build`. A failing step
  blocks everything downstream.
- **`deploy`** (`main` only, `needs: verify`): builds and pushes an image tagged with the commit SHA
  to `ghcr.io/<org>/khodarak:<sha>`, then SSHes into the production host and runs
  `scripts/deploy.sh <sha>`.

`scripts/deploy.sh <image-tag>` pulls that tag via `docker-compose.prod.yml`, restarts the `web`
service, and polls `/api/health` until it's healthy (or times out). `scripts/rollback.sh
<previous-image-tag>` is the same mechanism run against a known-good previous tag — no rebuild
needed, since the image is already in the registry. Required host secrets:
`PRODUCTION_HOST` / `PRODUCTION_SSH_USER` / `PRODUCTION_SSH_KEY` / `PRODUCTION_APP_DIR`.

Rollback must be exercised at least once against a real deployment before it's trusted — see
`specs/010-phase-9-hardening-launch/LAUNCH_CHECKLIST.md` (FR-009) for whether that has happened yet.

## Monitoring & going live

`GET /api/health` is also the target for an external uptime checker (poll every 1–5 minutes, alert
on failure — see `specs/010-phase-9-hardening-launch/contracts/monitoring.md`). The admin
dashboard's counters (`components/admin/counters/CountersOverview.tsx`) surface active
subscriptions, today's orders, this month's revenue, and auto-suspensions in the last 7 days as an
at-a-glance operational signal.

Cutting over from `pk_test_`/`sk_test_` Moyasar credentials to live ones, and the full go/no-go
launch checklist, are documented in `specs/010-phase-9-hardening-launch/` (`.env.production.example`,
`AUDIT_FINDINGS.md`, `LAUNCH_CHECKLIST.md`) — read `LAUNCH_CHECKLIST.md` before declaring the
product launched; several of its rows require a real production host and real credentials an agent
cannot provide, and are intentionally left for the team to close out.

## Project structure

Every future phase adds into this structure — there should never be a second place for the same
kind of file.

| Path | Purpose |
|---|---|
| `app/` | Routes (Next.js App Router). One folder per route segment; `app/(marketing)/page.tsx` is `/`. |
| `app/api/` | Route Handlers (the `/api/*` backend). |
| `components/ui/` | Shared, design-token-driven UI primitives (`Card`, `Button`, `Container`, `TopNav`). Page-specific components live next to the page that uses them; only reusable ones go here. |
| `lib/supabase/` | Supabase client helpers — `client.ts` (browser, anon key only) vs. `server.ts` (server-only). Never import `server.ts` from a Client Component. |
| `lib/env.ts` / `lib/env.server.ts` | Runtime-validated environment configuration — public vars vs. server-only secrets. |
| `lib/store/` | Redux Toolkit store. Add feature slices here as later phases introduce client-side state (e.g. cart). |
| `tailwind.config.ts` | Design tokens (colors, `organic` radius, spacing, typography) ported verbatim from `design/*.html` — do not re-derive; edit this file, not per-component overrides. |
| `tests/unit/` | Vitest unit tests. |
| `tests/e2e/` | Playwright end-to-end tests. |

Business logic that doesn't exist yet (e.g. the pricing engine in Phase 3) gets its own directory
under `lib/` when it's introduced — e.g. `lib/pricing/` — rather than living inside a route file.

## Design mockups

`design/*.html` are the static reference mockups every customer-facing route is pinned to (see
`plan.md` §0.B for the route → mockup mapping). `/admin` and `/login` have no mockup yet and use
the shared design tokens with a generic layout until one is provided.

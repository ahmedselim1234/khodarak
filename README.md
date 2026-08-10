# خضارك (Khodarak)

Fresh produce subscription — Next.js App Router + TypeScript + Supabase, RTL-first.

This is Phase 0 (Foundation): a styled, reachable shell for every committed route, with no
business logic yet. See [plan.md](./plan.md) and
[specs/001-phase-0-foundation](./specs/001-phase-0-foundation) for the full spec, plan, and task
breakdown.

## Getting started

```bash
cp .env.example .env.local   # fill in your Supabase project's URL + keys
npm install
npm run dev
```

Visit `http://localhost:3000`. Check `http://localhost:3000/api/health` to confirm the app can
reach your configured Supabase project.

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

# MotionFlix Implementation Plan

Each phase ends with `npm run check` (lint + typecheck + build) passing and
the UI showing only what really works.

## Phase 1 — Foundation ✅

- [x] Next.js 16 + TypeScript + Tailwind v4 scaffold
- [x] Design tokens and UI primitives (`Button`, `Badge`, icons, logo)
- [x] Responsive header with mobile menu; footer; skip link
- [x] Featured hero, horizontal `VideoRow`, `VideoCard`
- [x] Original procedural placeholder artwork (`PosterArt`)
- [x] Single data-access seam (`src/lib/library.ts`) over a sample catalog
- [x] Architecture doc, roadmap, `.env.example` (placeholders only)

### Phase 1b — Netflix-style UI ✅

- [x] Billboard hero (desktop) and poster-card hero (mobile)
- [x] Nav with categories, Browse menu, mobile chips, search, profile menu
- [x] Rows: Recently Added, Continue Watching (sample progress), Cinematic
      Films, AI Explainers, Motion Design, Experiments, Late-Night Ambient
- [x] Hover preview pop-overs, paging arrows, page indicators
- [x] "More info" modal with More Like This
- [x] Category pages (`/browse/[slug]`) and search (`/search?q=`) over the
      sample catalog
- [x] 22 original generated artworks (`scripts/generate-artwork.mjs`)

## Phase 2 — Authentication (next)

Goal: only the owner can see anything.

1. Create a Supabase project; disable public sign-ups; enable email
   magic link. Add redirect URL `http://localhost:3000/auth/callback`.
2. `npm i @supabase/supabase-js @supabase/ssr`.
3. Add `src/lib/supabase/{server,client}.ts` (cookie-based SSR clients) and
   `src/lib/env.ts` validating required env vars at startup.
4. Add `src/proxy.ts` to refresh the session and redirect signed-out users to
   `/login`.
5. Build `/login` (email form → magic link) and `/auth/callback` route handler.
6. Enforce `MOTIONFLIX_ALLOWED_EMAILS` server-side after sign-in.
7. Replace the disabled "Sign in" control with a real account menu + sign out.
8. Read the session behind `<Suspense>` (Cache Components requirement).

Done when: signed-out visitors can't load `/`; a non-allowlisted email is
rejected; the owner can sign in and out.

## Phase 3 — Library data

1. Supabase CLI migrations for the schema in `ARCHITECTURE.md`, with RLS.
2. Generated DB types; map rows → `Video` in `src/lib/library.ts`.
3. Home rows from real data: Recently Added + collections. Empty state when
   the library has no videos.
4. Title detail page (`/videos/[id]`) with metadata ("More info").
5. Real "Continue Watching" and "New" badges from data instead of the sample
   `placeholderProgress` and newest-six heuristic.
6. Remove `lib/placeholder/`, `public/artwork/` sample files and
   `FoundationNotice` once real data renders.

## Phase 4 — Storage, upload, playback

1. Private R2 bucket, bucket-scoped API token, CORS for the app origin.
2. Server-only R2 client; presigned PUT for upload, presigned GET for playback.
3. `/upload` page: pick file, title, tags → direct-to-R2 upload with progress
   → confirm → status `ready`.
4. Poster: extract a frame client-side or upload an image; store as
   `poster_key`; fall back to `PosterArt` when absent.
5. `/watch/[id]` with a native `<video>` player; enable the hero "Play" button.
6. Save/resume `watch_progress`; add a "Continue Watching" row.

## Phase 5 — Polish

Tag filters, "My List", collection management, deep-linkable details modal
(`?title=` param), keyboard navigation across rows, video deletion (DB row + R2 objects), loading skeletons, error
boundaries, basic tests (unit for `lib/`, Playwright smoke for the home page).

## Phase 6 — Deployment

Choose a host, configure env vars there, set production auth redirect URLs and
R2 CORS for the production origin, then deploy. Not started on purpose.

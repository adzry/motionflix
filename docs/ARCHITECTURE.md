# MotionFlix Architecture

MotionFlix is a private, single-owner video library for renders produced with
Claude Motion Studio. It's styled like a cinematic streaming app: dark UI,
featured hero, horizontal rows.

> **Status:** Phase 1 (Foundation). Only the UI shell and sample data exist.
> Auth, database, storage, uploads and playback are **not implemented** yet.
> See [ROADMAP.md](./ROADMAP.md).

## Stack

| Concern        | Choice                                     | Status        |
| -------------- | ------------------------------------------ | ------------- |
| Framework      | Next.js 16 (App Router, Turbopack)         | ✅ In place   |
| Language       | TypeScript (strict)                        | ✅ In place   |
| Styling        | Tailwind CSS v4 (CSS-first `@theme` tokens) | ✅ In place   |
| Rendering      | Cache Components + Partial Prefetching     | ✅ Enabled    |
| Auth           | Supabase Auth (email magic link + allowlist) | ⏳ Phase 2  |
| Database       | Supabase Postgres with Row Level Security  | ⏳ Phase 3    |
| Media storage  | Cloudflare R2, private bucket, presigned URLs | ⏳ Phase 4 |
| Hosting        | Not decided; no deployment yet             | ⏳ Phase 6    |

## Directory layout

```
src/
  app/                    Routes (App Router)
    layout.tsx            Root shell: fonts, header, footer, skip link
    page.tsx              Home: featured hero + video rows
    globals.css           Tailwind import + design tokens (@theme)
  components/
    ui/                   Generic primitives, no domain knowledge
      button.tsx          <Button> + buttonStyles() for links
      badge.tsx, icons.tsx, logo.tsx
    layout/               App chrome
      site-header.tsx     Client: scroll-aware bar + mobile menu
      site-footer.tsx
    library/              Video-library domain components
      featured-hero.tsx   Full-bleed featured title
      video-row.tsx       Client: horizontal scroller with arrows
      video-card.tsx      16:9 tile
      poster-art.tsx      Procedural placeholder artwork (original, no images)
      foundation-notice.tsx  "This is sample data" banner
  config/site.ts          Site name, nav items (with `comingSoon` flags)
  lib/
    library.ts            DATA-ACCESS SEAM: pages read library data only here
    placeholder/catalog.ts Sample titles (all flagged isPlaceholder)
    format.ts, cn.ts      Small utilities
  types/video.ts          Domain types (Video, Collection, PosterArt)
docs/                     Architecture + roadmap
```

### Conventions

- **Server Components by default.** Only components that need browser state or
  events are `"use client"` (`site-header`, `video-row`).
- **Design tokens live in `globals.css` `@theme`.** Use `bg-canvas`,
  `bg-surface`, `text-muted`, `text-subtle`, `bg-flare`, `border-line`, etc.
  instead of hex values.
- **`components/ui` never imports from `components/library`.** Domain
  components compose primitives, not the other way round.
- **One data seam.** UI never imports `lib/placeholder/*` directly; it calls
  `lib/library.ts`. Swapping placeholders for Supabase queries changes one
  module, not the pages.
- **Honest UI.** Features that don't exist render as disabled controls or
  "Soon" badges; nothing links to a 404 or pretends to work.
- **Next.js 16 differs from older versions.** Read
  `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).

## Rendering model

Cache Components is on (`cacheComponents: true`). Today `/` is fully static.
Once auth lands, anything that reads cookies/session runs at request time and
**must sit behind `<Suspense>`** so the static shell (header, layout) can still
be prerendered. Follow
`node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.

## Planned: authentication (Phase 2)

- Supabase Auth with `@supabase/ssr`, cookie-based sessions.
- Email magic link (or OTP). No public sign-up flow is exposed.
- **Allowlist:** after sign-in, the server checks the user's email against
  `MOTIONFLIX_ALLOWED_EMAILS`; anyone else is signed out. Supabase project
  settings should also disable open sign-ups.
- `src/proxy.ts` (Next 16's replacement for `middleware.ts`) refreshes the
  session and redirects unauthenticated requests to `/login`. Authorization is
  re-checked in the data layer — the proxy is a convenience, not the security
  boundary.

## Planned: data model (Phase 3)

Supabase Postgres, every table with RLS `owner_id = auth.uid()`.

```sql
create type video_status as enum ('uploading', 'processing', 'ready', 'failed');

create table videos (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  synopsis         text not null default '',
  duration_seconds integer,
  status           video_status not null default 'uploading',
  media_key        text not null unique,   -- R2 object key, never a public URL
  poster_key       text,                   -- R2 object key for poster image
  content_type     text,
  size_bytes       bigint,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table collection_videos (
  collection_id uuid references collections(id) on delete cascade,
  video_id      uuid references videos(id) on delete cascade,
  position      integer not null default 0,
  primary key (collection_id, video_id)
);

create table watch_progress (
  owner_id         uuid not null references auth.users(id) on delete cascade,
  video_id         uuid not null references videos(id) on delete cascade,
  position_seconds integer not null default 0,
  updated_at       timestamptz not null default now(),
  primary key (owner_id, video_id)
);
```

Migrations will live in `supabase/migrations/` (Supabase CLI) and TypeScript
types will be generated from the schema.

## Planned: storage, upload and playback (Phase 4)

```
Browser ──(1) request upload──▶ Server Action (auth + allowlist check)
        ◀─(2) presigned PUT URL, row created (status=uploading)
Browser ──(3) PUT file directly──▶ R2 private bucket
Browser ──(4) confirm upload──▶ Server Action (HEAD object, set status=ready)

Watch page ──▶ Server (auth) ──▶ presigned GET URL (short TTL) ──▶ <video src>
```

- Bucket is **private**; no public bucket access or `r2.dev` URL.
- R2 credentials are server-only, used via the S3-compatible API
  (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`).
- Bucket CORS allows `PUT`/`GET` only from the app's origin.
- Initial format: MP4 (H.264/AAC, `faststart`) played with native
  `<video>`, which supports range requests from R2. HLS/transcoding is out of
  scope until it's needed.
- Object keys: `users/{owner_id}/videos/{video_id}/source.mp4` and
  `.../poster.jpg`.

## Security notes

- No secrets in the repo. `.env.example` holds placeholders only;
  `.env*` is git-ignored except the example.
- `robots: noindex` is set site-wide; this is a private app.
- Anything prefixed `NEXT_PUBLIC_` ships to the browser — only the Supabase URL
  and publishable key may use it.

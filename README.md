# MotionFlix

A private, Netflix-inspired personal video library for videos produced with
Claude Motion Studio.

> **Current phase: 1 — Foundation + Netflix-style UI.** Home, category and
> search pages, hover previews and a details modal all work over **sample
> titles with original generated artwork**. Sign-in, cloud storage, uploads,
> My List and playback are **not implemented yet**; they're marked "Soon" in
> the UI or explain themselves with a notice when clicked.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · planned: Supabase
Auth + Postgres, Cloudflare R2 (private bucket).

## Getting started

Requires Node.js ≥ 20.9.

```bash
npm install
npm run dev          # http://localhost:3000
```

No environment variables are needed for Phase 1. For later phases, copy
`.env.example` to `.env.local` and fill in real values (never commit it).

## Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                        |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript) |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`     |
| `npm run build`     | Production build                              |
| `npm run start`     | Serve the production build                    |
| `npm run check`     | lint + typecheck + build                      |
| `node scripts/generate-artwork.mjs` | Regenerate sample artwork in `public/artwork` |

## Docs

- [Architecture](docs/ARCHITECTURE.md): structure, conventions, planned
  auth/data/storage design
- [Roadmap](docs/ROADMAP.md): phased implementation plan and next steps

MotionFlix is a personal project and is not affiliated with Netflix.

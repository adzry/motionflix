# MotionFlix

A private, Netflix-inspired personal video library for videos produced with
Claude Motion Studio.

> **Current phase: 1 — Foundation.** The home page UI (navigation, featured
> hero, horizontal video rows) renders with **sample titles and generated
> placeholder artwork**. Sign-in, cloud storage, uploads and playback are
> **not implemented yet** and are shown as disabled / "Soon" in the UI.

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

## Docs

- [Architecture](docs/ARCHITECTURE.md): structure, conventions, planned
  auth/data/storage design
- [Roadmap](docs/ROADMAP.md): phased implementation plan and next steps

MotionFlix is a personal project and is not affiliated with Netflix.

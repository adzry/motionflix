@AGENTS.md

## MotionFlix project notes

- Read `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` before changing structure.
- Pages read library data only through `src/lib/library.ts`.
- Never commit secrets; `.env.example` holds placeholders only.
- Don't present unimplemented features (auth, storage, playback) as working.
- Run `npm run check` (lint + typecheck + build) before committing.

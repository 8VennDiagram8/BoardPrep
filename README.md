# BoardPrep

An interactive board exam reviewer built with **Vite + React + TypeScript + Tailwind CSS**, with optional **Supabase** auth/data sync and **Vercel** deployment.

Currently bundled programs:

- **ECELE** — Electronics and Communications Engineering Licensure Examination
- **ECTLE** — Electronics Engineering Technician Licensure Examination

The catalog is data-driven, so more programs, subjects and topics can be added later.

## Features

- Program and subject browser with per-topic progress
- Topic practice drills with instant feedback and explanations
- Timed mixed-subject mock exams with a countdown and locked answers
- Results page with score, subject breakdown and full answer review
- Flashcards with flip, shuffle, and known/review-again tracking
- Progress analytics: accuracy trend, mastery table, streak and session history
- Guest (demo) mode plus Supabase email/password authentication
- Light/dark themes, responsive layout, JSON progress export

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. With no environment variables the app runs in **demo mode**: content is bundled in `src/data/seed.ts` and attempts are stored in `localStorage`.

## Connect Supabase

1. Create a Supabase project.
2. Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) in the SQL editor.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to load the starter question bank.
4. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
5. Restart the dev server.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The app falls back to the bundled catalog if Supabase is unreachable, so it still works offline.

> Change the content in `src/data/seed.ts`, then run `npm run seed:generate` to regenerate `supabase/seed.sql`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |
| `npm run seed:generate` | Regenerate Supabase seed SQL from the TS catalog |

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel (framework preset: Vite).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables (optional).
4. Deploy. `vercel.json` handles SPA rewrites.

GitHub Actions CI runs on pushes and pull requests (see `.github/workflows/ci.yml`).

## Project structure

```
src/
  components/     App shell and shared UI
  context/        Auth and application state
  data/           Bundled catalog (programs, questions, flashcards)
  lib/            Supabase client, API layer, local storage, helpers
  pages/          Route screens
supabase/
  migrations/     Database schema and RLS policies
  seed.sql        Generated starter content
scripts/          Seed generator
```

## Adding a program

Add an entry to `programs` and its subjects/topics/questions in `src/data/seed.ts`, then regenerate the SQL seed. The UI automatically discovers new programs from the catalog.

---

Built for engineers. Review responsibly.

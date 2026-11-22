# BoardPrep

An interactive board exam reviewer built with **Vite + React + TypeScript + Tailwind CSS**, with optional **Supabase** auth/data sync and **Vercel** deployment.

Currently bundled programs:

- **ECELE** — Electronics Engineering Licensure Examination
- **ECTLE** — Electronics Engineering Technician Licensure Examination

The catalog is data-driven, so more programs, subjects and topics can be added later.

## Features

- Program and subject browser with per-topic progress
- Topic practice drills with instant feedback and explanations
- Timed mixed-subject mock exams with a countdown and locked answers
- Results page with score, subject breakdown and full answer review
- Flashcards with flip, shuffle, and known/review-again tracking
- **Question bank tools** — generate questions with `gemini-3.6-flash`, extract them from uploaded PDFs, or type them manually — all with answers and solutions
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
3. Run migrations `002_generated_questions.sql`, `003_manual_question_source.sql` and `004_question_ownership.sql` in order (generated/manual question columns, insert policy, and per-account ownership).
4. Run [`supabase/seed.sql`](supabase/seed.sql) to load the starter question bank.
5. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
6. Restart the dev server.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The app falls back to the bundled catalog if Supabase is unreachable, so it still works offline.

> Change the content in `src/data/seed.ts`, then run `npm run seed:generate` to regenerate `supabase/seed.sql`.

### Per-account data

Every signed-in account has its own data. localStorage keys are suffixed with the account id (`boardprep:settings:<id>`, `boardprep:attempts:<id>`, `boardprep:known:<id>`, `boardprep:custom-questions:<id>`), and guests get their own generated guest id. In Supabase, `attempts` and user-added `questions` have a `user_id` and RLS policies that expose only the owner's rows. The bundled seed catalog is shared and read-only. Switching accounts on the same browser therefore never mixes progress, preferences, flashcard marks or generated questions.

## Question bank tools

Open **Question Bank** in the sidebar. It has three tabs:

- **Generate with AI** — pick a board, subject and scope (single topic, all topics in a subject, or all topics in the program), choose questions per topic, then generate. Every item has four options, one correct answer and a written solution.
- **Import PDF** — upload a PDF (up to 20 MB). Large files are split into page batches in the browser and processed one batch at a time, so dense questionnaires (hundreds or thousands of items) aren't cut off by a single response limit. Choose **Pages per batch** (2–10; smaller = more thorough). With **auto-detect topic per question** on (default), each question is classified into the most relevant topic — even when the questionnaire is randomly ordered — and the preview groups questions by detected topic. You can turn it off to tag everything under one chosen topic.
- **Type manually** — enter a question, four options, mark the correct one, and write the solution. Build a draft and save it when done; you can edit draft items before saving.

Saved questions immediately appear in practice, mock exams, analytics and flashcard topics.

The browser calls BoardPrep's own `/api/generate-questions` and `/api/import-pdf` routes. The key is **server-side only** — set `GEMINI_API_KEY` in `.env.local` for development or in Vercel for production; there is no key field in the UI and the key is never sent to the browser. The model used is `gemini-3.6-flash` with structured JSON output and low thinking for faster generation.

```env
GEMINI_API_KEY=your-gemini-api-key
```

PDF extraction saves each finished batch to the question bank immediately, so you can **Cancel** at any time and keep everything extracted so far. Progress shows the current page range and the running saved count.

Generation and PDF extraction run in a module-level job store (`src/lib/jobs.ts`), so they continue in the background when you switch Question Bank tabs or navigate to another page. Return to the tab any time to see live progress, preview results, or cancel.

Questions are stored in `localStorage` in demo mode, or in the Supabase `questions` table when connected (run migrations `002` and `003`).

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
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `GEMINI_API_KEY` as environment variables (all optional).
4. Deploy. `vercel.json` handles SPA rewrites and the `/api` function.

GitHub Actions CI runs on pushes and pull requests (see `.github/workflows/ci.yml`).

## Project structure

```
src/
  components/     App shell and shared UI
  context/        Auth and application state
  data/           Bundled catalog (programs, questions, flashcards)
  lib/            Supabase client, API layer, local storage, helpers
  pages/          Route screens
api/              Vercel serverless function for question generation
server/           Shared Gemini generation logic (used by Vercel + dev server)
supabase/
  migrations/     Database schema and RLS policies
  seed.sql        Generated starter content
scripts/          Seed generator
```

## Adding a program

Add an entry to `programs` and its subjects/topics/questions in `src/data/seed.ts`, then regenerate the SQL seed. The UI automatically discovers new programs from the catalog.

---

Built for engineers. Review responsibly.

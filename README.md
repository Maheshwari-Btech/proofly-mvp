# Proofly

**Proofly — The Missing Step Between Applying and Being Ready.**

Proofly is a career-readiness workspace that connects opportunity requirements to verifiable evidence, readiness gaps, Career Trials, learning resources, mentors, and SkillSwap.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS and Storage
- Gemini server-side AI via Express
- Zod validation

## Local launch

```bash
npm install
npm run lint
npm run build
npm run dev
```

Then open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env` and configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (server-side only)

Never expose `GEMINI_API_KEY` in a `VITE_*` variable.

## Supabase

Use the canonical migrations in `supabase/migrations/` in order:

1. `20260101000001_core_schema.sql`
2. `20260101000002_storage_and_rls.sql`
3. `20260101000003_triggers_and_functions.sql`
4. `20260101000004_seed_data.sql` (optional demo helper)
5. `20260101000005_launch_hardening.sql`

The previous 2024 legacy migration was removed because it conflicts with the current table names and architecture.

**If you already applied the old 2024 schema to a Supabase project, do not blindly run these migrations on top of it. Use a fresh Supabase project or perform a reviewed database migration.**

For detailed setup and launch checks, read `docs/SUPABASE_SETUP.md`.

## Production deployment

The included `render.yaml` can deploy the full Express + Vite application to Render. A `Dockerfile` is also included for container hosts such as Cloud Run.

The server listens on the hosting provider's `PORT` and exposes `/api/health`.

## Important product behavior

- Guest mode is local/demo only.
- Authenticated user data is namespaced and persisted to Supabase.
- Private evidence/trial files use private Storage buckets.
- SkillSwap discovery does not expose the full `profiles` table.
- AI requests are rate-limited server-side.
- Contact and mentor submissions fail honestly instead of displaying false success.

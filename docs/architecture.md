# Architecture

WorkShift is a Next.js (App Router) application backed by PostgreSQL,
with a Cloudflare Worker handling scheduled ingestion and scoring
jobs.

## Layers

```
app/            Next.js routes (pages + API route handlers)
components/     Presentational + client components
lib/            Framework-agnostic domain logic
  ai/           Provider-agnostic AI abstraction
  scoring/      Documented, versioned scoring engine
  ingestion/    Source registry + adapters
  security/     SSRF-safe fetch, admin session, headers
  validation/   Zod schemas (AI outputs, API inputs)
  db/           Prisma client singleton
server/services Orchestration that ties lib/ modules together
                (ingestion pipeline, future scoring/report jobs)
workers/        Cloudflare Worker entrypoint (cron dispatch)
prisma/         Schema + migrations
scripts/        CLI scripts (seed, data-integrity scan)
tests/          Unit / integration / e2e
docs/           This directory
```

## Data flow

```
Source Registry → Adapter → Raw record → Dedup → NewsArticle/ResearchItem
        → AI claim extraction (validated) → Claim → Evidence
        → Scoring engine (lib/scoring) → OccupationScore
        → Public API / pages (read-only from the database)
```

The AI layer never writes directly to `OccupationScore`. It can only
produce `Claim`/`Evidence`/summary records, which are Zod-validated
before persistence. The score itself is deterministic arithmetic over
evidence-derived task attributes — see `docs/scoring-methodology.md`.

## Hosting

- **Vercel** hosts the Next.js application (SSR pages + `/api/*`
  routes).
- **Cloudflare** hosts the scheduled Worker (`workers/src/scheduled.ts`)
  for ingestion/recalculation cron jobs, and can front the app with
  DNS/CDN/WAF.
- **Postgres** (Supabase or any standard Postgres) is the system of
  record; Prisma manages schema + migrations.

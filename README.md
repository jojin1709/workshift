# WorkShift

**People. Skills. A Changing World.**

An evidence-driven, global AI Career Intelligence platform. WorkShift
helps students, professionals, educators, researchers, and career
changers understand how AI is changing occupations, tasks, skills,
industries, and career opportunities — without login, without
fabricated statistics, and without predicting the future with false
confidence.

> This platform provides evidence-based analysis and does not
> guarantee future employment outcomes.

## Features

- Occupation explorer with task-level AI exposure analysis
- Country pages with honest data-coverage labeling
- Skill explorer (current exposure + demand evidence, never
  "future-proof" claims)
- Verified-only course discovery (real provider links; "Price not
  verified" instead of invented prices)
- AI news & research feeds sourced from real, linked publishers
- Career comparison tool
- AI-assisted, no-account recommendation tool grounded only in real
  database records
- Fully public — no login/signup anywhere on the main site
- Protected internal admin dashboard for pipeline/source health
- Transparent, versioned scoring methodology (`/methodology`)

## Architecture

See `docs/architecture.md` for the full breakdown. In short: Next.js
(App Router) + PostgreSQL/Prisma + a provider-agnostic AI abstraction
+ a Cloudflare Worker for scheduled ingestion, all guarded by a
documented, non-LLM scoring engine and Zod-validated AI outputs.

## Technology stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend/API:** Next.js route handlers, Cloudflare Workers
- **Hosting:** Vercel (app), Cloudflare (Workers/DNS/CDN/WAF)
- **Database:** PostgreSQL (Supabase recommended), Prisma ORM
- **Validation:** Zod
- **Charts:** Recharts (wired for future dashboard visualizations)
- **Search:** PostgreSQL full-text/`contains` search today, structured
  so vector search can be added later without a redesign

## Database architecture

See `docs/database.md` and `prisma/schema.prisma`.

## AI architecture

See `docs/ai-system.md`. Providers (Anthropic, OpenAI, Gemini,
OpenRouter, Groq) are selected purely via environment variables — the
app never hard-codes a single vendor.

## Data pipeline

See `docs/data-pipeline.md` and `docs/source-policy.md`.

## Scoring methodology

See `docs/scoring-methodology.md` and the in-app `/methodology` page.

## Local setup

```bash
npm install
cp .env.example .env   # fill in real values
npm run db:migrate:dev
npm run dev
```

The app runs with an **empty database** out of the box — see
"Data status" below. Every page will show honest empty states until
you configure and run real ingestion.

## Environment variables

See `.env.example` — every variable listed there is actually read by
the codebase. Optional integrations (AI providers, Redis, Cloudflare)
degrade gracefully when unset; they never trigger fabricated data.

## Database setup

```bash
npm run db:migrate:dev   # local development migrations
npm run db:migrate       # apply existing migrations (CI/production)
```

There is intentionally **no fabricated seed data**. See
`docs/data-quality.md` for why, and for how to load real data via the
ingestion pipeline once you've configured real sources.

## Worker setup

```bash
npm run worker:dev       # local Cloudflare Worker dev server
npm run worker:deploy    # deploy the scheduled worker
```

## Vercel deployment

See `docs/deployment.md`.

## Cloudflare deployment

See `docs/deployment.md` and `wrangler.toml`.

## Testing

```bash
npm run lint
npm run typecheck
npm run test              # unit tests
npm run test:integration  # integration tests (requires DATABASE_URL)
npm run test:e2e          # Playwright e2e (requires a running app)
npm run quality:scan      # scans for placeholder/fake-data markers
```

## Security

See `docs/security.md`: SSRF-safe ingestion fetcher, Zod-validated AI
I/O, rate limiting, signed admin sessions, CSP/security headers,
parameterized queries throughout via Prisma, and prompt-injection
handling for untrusted source text.

## Data quality

See `docs/data-quality.md`.

## Data status in this repository

**This repository ships with zero seeded records.** It was built in
an environment without general internet access, so no real
occupation, country-score, news, or research data could be verified
and ingested here. Every source in the registry is marked
`UNSUPPORTED` with a documented placeholder, and every page renders
its correct, honest empty state ("Insufficient reliable data", "No
verified updates are currently available") rather than showing
invented content. See `docs/data-quality.md` for exactly how to bring
in real data.

## Limitations

- No source has been ingested or verified from this build environment.
- The HTML scraping adapter requires a DOM parser to be wired in at
  deploy time (documented in `lib/ingestion/adapters/other-adapters.ts`)
  to avoid bundling a heavy dependency unconditionally.
- E2E tests assume a running instance with `DATABASE_URL` and at least
  one seeded record; they will need real data to exercise
  non-empty-state UI paths.
- The admin auth is a minimal signed-cookie mechanism suitable for a
  small operator team; swap in SSO/OAuth for larger deployments.

## License

Choose and add a license appropriate for your deployment (e.g. MIT,
Apache-2.0). None is bundled by default.

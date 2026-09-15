# Data Pipeline

## Stages

1. **Source Registry** (`lib/ingestion/source-registry.ts`) — the only
   place new sources are declared. Every entry documents its type,
   adapter kind, and credibility level.
2. **Fetch** — `server/services/ingestion.ts` calls the adapter for
   each `ENABLED` source through `lib/security/safe-fetch.ts`, which
   blocks private IPs, cloud metadata endpoints, disallowed protocols,
   and unvalidated redirects (SSRF protection).
3. **Validate / Parse / Normalize** — adapter-specific; each adapter
   returns a `RawIngestedRecord` shape, never raw provider-specific
   JSON.
4. **Deduplicate** — records are keyed by `originalUrl` (unique
   constraint in the schema); a second ingestion of the same URL is a
   no-op.
5. **Classify / Extract claims** — `lib/ai/tasks.ts` functions call the
   active AI provider (if configured) to extract structured claims,
   validated against `lib/validation/ai-schemas.ts`. Failures are
   logged and the record is skipped, never force-published.
6. **Store evidence** — validated claims become `Claim` + `Evidence`
   rows, linked to occupations/skills via join tables.
7. **Score** — `lib/scoring/exposure-engine.ts` aggregates
   evidence-backed task attributes into an `OccupationScore` /
   `CountryOccupationScore`, versioned by `methodologyVersion`.

## Failure isolation

Every source run is wrapped in a `SourceRun` record. A thrown error in
one source's adapter is caught, logged, and marked `FAILED` on that
`Source` — it does not stop the loop over the other sources (see
`runIngestionPass` in `server/services/ingestion.ts`).

## Scheduling

See `wrangler.toml` `[triggers]` and `workers/src/scheduled.ts` for
the cron → job mapping:

| Cron | Job |
|---|---|
| Hourly | Check high-priority AI/news sources |
| Every 6 hours | Research/data updates |
| Daily 02:30 | Process new evidence |
| Daily 03:00 | Update occupation/task relationships |
| Daily 03:30 | Recalculate impacted scores |
| Weekly (Mon 04:00) | Deep source health check |
| Weekly (Mon 04:30) | Data quality report |

## Current status in this repository

No source in `SOURCE_REGISTRY` is currently `ENABLED` — every entry is
a documented placeholder (`status: "UNSUPPORTED"`) because this
codebase was built in an environment without general internet access
to verify real feeds/APIs. Before enabling a source: confirm its feed
or API actually works, confirm it's permitted by its terms/robots.txt,
add its hostname to `INGESTION_ALLOWED_HOSTS`, and flip its `status` to
`ENABLED`.

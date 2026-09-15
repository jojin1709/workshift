# Data Quality

## Automated checks

- `scripts/production-data-integrity-check.ts` scans the built codebase
  for forbidden placeholder markers (`mock`, `dummy`, `fake`, `sample`,
  `TODO`, `coming soon`, `lorem ipsum`, `example.com`, etc.) so nothing
  fabricated ships to production. Run via `npm run quality:scan`; it's
  also wired into CI (`.github/workflows/ci.yml`).
- `tests/unit/scoring.test.ts` and `tests/unit/validation.test.ts` cover
  the scoring engine and AI-output validation logic.
- `DataQualityEvent` rows record broken URLs, duplicates, missing
  metadata, and stale sources found during ingestion; the admin
  dashboard (`/admin`) surfaces unresolved ones.

## Current data status in this repository

This build ships with **zero seed rows** by design. Every entry in
`lib/ingestion/source-registry.ts` is a documented placeholder marked
`UNSUPPORTED`. This is intentional: the environment this codebase was
built in does not have general internet access to fetch and verify
real datasets (O*NET, national statistics offices, research
repositories, etc.), and the project's own rules (see product spec
§48–51, §77–79) forbid inventing seed data to make the site look
populated.

To populate real data:

1. Verify a real source (API/feed/dataset) works and is permitted —
   see `docs/source-policy.md`.
2. Add it to `SOURCE_REGISTRY` with `status: "ENABLED"`.
3. Add its hostname to `INGESTION_ALLOWED_HOSTS`.
4. Run `npm run worker:dev` or trigger `runIngestionPass()` directly to
   pull real records.
5. Run the scoring recalculation job to produce real
   `OccupationScore` rows from the resulting evidence.

Until that happens, every page in this app will honestly show empty
states ("No verified updates are currently available", "Insufficient
reliable data") rather than placeholder content — which is the
correct, spec-compliant behavior for an unseeded deployment.

## What "fake" means in this codebase's checks

The integrity scan is deliberately broad. If you legitimately need the
word "sample" (e.g., a code comment about a statistical sample), the
scan will flag it for manual review rather than silently ignore it —
false positives are preferable to missed fabricated data.

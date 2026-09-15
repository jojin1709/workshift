# Reference data

Place only legitimate, licensed, documented static reference datasets
here (e.g. an ISO 3166 country list). For each file added:

- Document its exact origin and license in `docs/data-quality.md`.
- Never hand-edit or fabricate values within it.
- Wire it up via `scripts/seed.ts` or a `StaticJsonAdapter`
  (`lib/ingestion/adapters/other-adapters.ts`), not by inserting rows
  manually elsewhere in the codebase.

This directory is intentionally empty in this build — see
`docs/data-quality.md` for why.

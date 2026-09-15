# Database

PostgreSQL, managed via Prisma (`prisma/schema.prisma`). Run
`npm run db:migrate:dev` locally to create/apply migrations,
`npm run db:migrate` to apply existing migrations in CI/production.
Never hand-edit the production schema outside a migration.

## Key tables

- `Country`, `Region` — geography + `coverageLevel`
- `Occupation`, `OccupationTask` — occupation taxonomy + task-level
  evidence attributes
- `Skill`, `OccupationSkillLink`, `SkillCountry`
- `Course`, `CourseSkillLink`, `CourseCountry`
- `Source`, `SourceRun` — the registry's runtime state + audit trail
- `NewsArticle`, `ResearchItem` — ingested, deduplicated content
- `Claim`, `Evidence`, `OccupationEvidence`, `SkillEvidence` —
  provenance chain from a claim to the sources backing it
- `OccupationScore`, `CountryOccupationScore` — versioned, timestamped
  scoring output
- `DataQualityEvent`, `PipelineRun` — observability

## Indexes

Indexes are declared in the schema on the fields the app actually
queries by: occupation/skill/country name and code lookups, source
type/status, and publication/update timestamps for freshness-ordered
queries. Add new indexes alongside new query patterns rather than
speculatively.

## Provenance

Every meaningful conclusion is traceable:
`Occupation → OccupationTask → Claim → Evidence → Source`. The
`/careers/[slug]` page and `/api/careers/[slug]` endpoint both surface
this chain (see the "Sources" section of the career page).

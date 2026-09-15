# Scoring Methodology

See also the in-app `/methodology` page, which mirrors this document
in user-facing language.

## Principle

The AI Exposure score is **not** produced by asking a language model
"rate this job out of 100." It is computed by
`lib/scoring/exposure-engine.ts` from evidence-derived task
attributes, using a fixed, documented, version-controlled formula.

## Dimensions and weights (Methodology 1.0)

| Dimension | Weight | Direction |
|---|---|---|
| Task automation exposure | 35% | increases score |
| Current AI adoption | 25% | increases score |
| Human interaction offset (100 − human dependency) | 15% | increases score |
| Contextual complexity | 10% | increases score |
| Physical-world requirement | 5% | decreases score |
| Accountability requirement | 5% | decreases score |
| Regulatory constraint | 5% | decreases score |

Task-level inputs (`technicalAiCapability`, `currentAdoption`,
`humanDependency`) are aggregated per occupation as an
evidence-count-weighted average, and tasks with zero evidence are
excluded from the average entirely (they must not silently drag a
score toward zero — see `aggregateTaskDimensions`).

## Confidence

Confidence is `STRONG` / `MODERATE` / `WEAK` / `CONFLICTING`, computed
from:

- evidence volume (more evidence → higher confidence)
- distinct source count (more independent sources → higher confidence)
- freshness of the most recent evidence
- explicit conflict detection — if two reliable sources disagree, the
  confidence is forced to `CONFLICTING` regardless of volume

See `calculateConfidence` in `lib/scoring/exposure-engine.ts`.

## Versioning

Every `OccupationScore` and `CountryOccupationScore` row stores the
`methodologyVersion` that produced it. Changing a weight or formula
requires bumping `METHODOLOGY_VERSION` and adding a changelog entry
below — historical rows are never overwritten in place.

### Changelog

- **1.0** — initial documented formula (this document).

## What this does not mean

- It is **not** a job-replacement probability.
- It is **not** a prediction about any individual's career.
- It reflects the evidence currently held in the database, which may
  be incomplete, stale, or (rarely) wrong.

## Country-level scores

`CountryOccupationScore` follows the same formula, restricted to
evidence tagged with that country. When country-specific evidence is
too sparse, the UI shows `Insufficient reliable data` for that country
rather than falling back to a global number silently — any fallback to
global evidence must be explicit and labeled in the UI copy.

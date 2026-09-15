# Source Policy

## Categories

`OFFICIAL`, `GOVERNMENT`, `RESEARCH`, `ACADEMIC`, `INDUSTRY`, `NEWS`,
`LABOR_MARKET`, `AI_PROVIDER`, `EDUCATION` — see `SourceType` in
`prisma/schema.prisma`.

## Acquisition priority

1. Official APIs
2. Official downloadable datasets
3. RSS/Atom feeds
4. Public research repository APIs
5. Public webpages, only where permitted by terms/robots.txt
6. Scraping — only where legally and technically appropriate, and
   only through the conservative, selector-configured
   `HtmlSourceAdapter` (never generic heuristic scraping)

## What we will not do

- Bypass robots.txt, paywalls, CAPTCHAs, authentication, or other
  access controls.
- Scrape a source with no documented, verified selector configuration.
- Ingest a source whose terms of service prohibit automated access.
- Fabricate a source, article, citation, DOI, author, or URL under any
  circumstance.

## Marking a source unsupported

If a source cannot be legally/reliably ingested, add it to
`lib/ingestion/source-registry.ts` with `status: "UNSUPPORTED"` and a
`unsupportedReason`. This documents that it was considered, without
pretending it contributes data.

## Credibility levels

`credibilityLevel` (1–5) feeds into confidence scoring
(`docs/scoring-methodology.md`). As a starting point:

- 5 — official government/statistical agency data
- 4 — peer-reviewed research, major standards bodies
- 3 — reputable industry/news publications
- 2 — general industry blogs, vendor material
- 1 — low-credibility or unverified sources (avoid ingesting these at
  all where possible)

## Attribution and copyright

We store short, paraphrased summaries and metadata — never full
reproduced article text. Every news/research item links to its
original source. See `docs/data-quality.md` for the automated checks
that catch missing attribution.

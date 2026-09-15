/**
 * Configurable source registry. This file defines WHICH sources the
 * pipeline is allowed to pull from and HOW (adapter kind). It does
 * NOT contain any ingested data — that lives in the database once a
 * real ingestion run succeeds.
 *
 * To add a source:
 *   1. Confirm it has a public API, RSS feed, or a dataset you are
 *      legally permitted to fetch (see docs/source-policy.md).
 *   2. Add an entry here with its adapter kind and credibility level.
 *   3. Add its hostname to INGESTION_ALLOWED_HOSTS in your env.
 *   4. If it cannot be ingested (no API/feed, paywalled, disallowed
 *      by robots.txt), do NOT add it — or add it with
 *      status: "UNSUPPORTED" to document that it was considered.
 */

export type SourceCategory =
  | "OFFICIAL"
  | "GOVERNMENT"
  | "RESEARCH"
  | "ACADEMIC"
  | "INDUSTRY"
  | "NEWS"
  | "LABOR_MARKET"
  | "AI_PROVIDER"
  | "EDUCATION";

export interface SourceRegistryEntry {
  id: string;
  name: string;
  publisher: string;
  type: SourceCategory;
  adapterKind: "rss" | "api" | "html" | "static-json" | "research" | "government-dataset";
  url: string;
  feedUrl?: string;
  apiUrl?: string;
  country?: string; // ISO alpha-2, omit for global sources
  credibilityLevel: 1 | 2 | 3 | 4 | 5;
  status: "ENABLED" | "UNSUPPORTED";
  unsupportedReason?: string;
}

/**
 * This list intentionally starts small and documented rather than
 * padded with entries that don't actually have a working feed. Each
 * one should be verified (URL reachable, feed valid, terms allow
 * ingestion) before flipping status to ENABLED in a real deployment.
 * None of these have been ingested in this build — see
 * docs/data-quality.md for current pipeline status.
 */
export const SOURCE_REGISTRY: SourceRegistryEntry[] = [
  {
    id: "example-govt-labor-stats",
    name: "National labor statistics open data portal",
    publisher: "Replace with your target national statistics office",
    type: "GOVERNMENT",
    adapterKind: "api",
    url: "https://example.gov/labor-statistics",
    status: "UNSUPPORTED",
    unsupportedReason:
      "Placeholder entry — no verified API endpoint configured yet. Replace with a real, verified " +
      "government statistics API before enabling.",
    credibilityLevel: 5
  },
  {
    id: "example-research-repository",
    name: "Open research repository (e.g. arXiv, SSRN metadata API)",
    publisher: "Replace with your target repository",
    type: "RESEARCH",
    adapterKind: "research",
    url: "https://example.org/research",
    status: "UNSUPPORTED",
    unsupportedReason: "Placeholder entry — configure a real repository API before enabling.",
    credibilityLevel: 4
  },
  {
    id: "example-ai-industry-news",
    name: "AI industry news RSS feed",
    publisher: "Replace with your target publication",
    type: "NEWS",
    adapterKind: "rss",
    url: "https://example.com",
    feedUrl: "https://example.com/feed.xml",
    status: "UNSUPPORTED",
    unsupportedReason: "Placeholder entry — configure a real, terms-compliant RSS feed before enabling.",
    credibilityLevel: 3
  }
];

export function enabledSources(): SourceRegistryEntry[] {
  return SOURCE_REGISTRY.filter((s) => s.status === "ENABLED");
}

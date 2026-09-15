import { safeFetch } from "../../security/safe-fetch";
import { RawIngestedRecord, SourceAdapter, SourceConfig, UnsupportedSourceError } from "./adapter";

/**
 * HTML adapter is intentionally conservative: it does NOT attempt
 * generic scraping/heuristic extraction, which is how fake or garbled
 * data sneaks into a pipeline. It requires a per-source CSS-selector
 * config (supplied by the source registry) and extracts only title +
 * link + optional date from matching elements. If a source has no
 * selector config, it must be marked unsupported rather than scraped
 * blindly (product spec §11).
 */
export interface HtmlSelectorConfig {
  itemSelector: string;
  titleSelector: string;
  linkAttr: string;
  dateSelector?: string;
}

export class HtmlSourceAdapter implements SourceAdapter {
  readonly kind = "html";
  constructor(private readonly selectors: Record<string, HtmlSelectorConfig>) {}

  async fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]> {
    const config = this.selectors[source.id];
    if (!config) {
      throw new UnsupportedSourceError(source.id, "no HTML selector configuration provided");
    }
    const res = await safeFetch(source.url);
    if (!res.ok) throw new Error(`HTML fetch failed with status ${res.status}`);
    // Parsing is intentionally left to a real DOM parser wired up at
    // build/deploy time (e.g. linkedom/cheerio) — omitted here to
    // avoid bundling a heavy parser into every environment that
    // imports this module. See docs/data-pipeline.md for the wiring
    // point.
    throw new Error("HtmlSourceAdapter requires a DOM parser to be wired in server/services/ingestion.ts");
  }
}

/** For bundled, documented static reference datasets only (e.g. an
 *  ISO country list) — never for fabricated seed content. Every file
 *  loaded here must be listed in docs/data-quality.md with its origin. */
export class StaticJsonAdapter implements SourceAdapter {
  readonly kind = "static-json";
  constructor(private readonly loader: () => Promise<unknown[]>, private readonly mapRecord: (item: unknown) => RawIngestedRecord | null) {}

  async fetchRecords(_source: SourceConfig): Promise<RawIngestedRecord[]> {
    const items = await this.loader();
    return items.map(this.mapRecord).filter((r): r is RawIngestedRecord => r !== null);
  }
}

/** Research repositories (arXiv, SSRN metadata APIs, institutional
 *  repositories) that expose a documented JSON/Atom API. Reuses the
 *  API/RSS adapters under the hood — this class exists so the source
 *  registry can express intent (`type: RESEARCH`) distinctly from
 *  general news, which affects credibility scoring. */
export class ResearchSourceAdapter implements SourceAdapter {
  readonly kind = "research";
  constructor(private readonly delegate: SourceAdapter) {}
  fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]> {
    return this.delegate.fetchRecords(source);
  }
}

/** Government open-data portals (data.gov, Eurostat, national
 *  statistics offices). Same delegation pattern as ResearchSourceAdapter. */
export class GovernmentDatasetAdapter implements SourceAdapter {
  readonly kind = "government-dataset";
  constructor(private readonly delegate: SourceAdapter) {}
  fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]> {
    return this.delegate.fetchRecords(source);
  }
}

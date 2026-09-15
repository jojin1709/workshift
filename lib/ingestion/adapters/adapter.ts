export interface RawIngestedRecord {
  title: string;
  url: string;
  publishedAt: Date | null;
  summary: string | null;
  raw: unknown;
}

export interface SourceConfig {
  id: string;
  name: string;
  type: string;
  url: string;
  feedUrl?: string | null;
  apiUrl?: string | null;
}

export interface SourceAdapter {
  readonly kind: string;
  /** Returns raw records from the source, or throws — the caller
   *  (server/services/ingestion.ts) is responsible for marking the
   *  source run failed and continuing with other sources. One broken
   *  source must never halt the whole pipeline (product spec §39). */
  fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]>;
}

export class UnsupportedSourceError extends Error {
  constructor(sourceId: string, reason: string) {
    super(`Source ${sourceId} is unsupported: ${reason}`);
  }
}

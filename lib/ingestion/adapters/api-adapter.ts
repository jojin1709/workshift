import { safeFetch } from "../../security/safe-fetch";
import { RawIngestedRecord, SourceAdapter, SourceConfig } from "./adapter";

/**
 * Generic adapter for a JSON API that returns a list of records.
 * `mapRecord` must be supplied per-source (in the source registry
 * config) since every government/research API has its own schema —
 * this adapter never guesses field names or invents values for
 * missing fields.
 */
export type RecordMapper = (item: unknown) => RawIngestedRecord | null;

export class ApiSourceAdapter implements SourceAdapter {
  readonly kind = "api";
  constructor(private readonly mapRecord: RecordMapper, private readonly listPath: string[] = []) {}

  async fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]> {
    if (!source.apiUrl) {
      throw new Error(`API adapter requires apiUrl for source ${source.id}`);
    }
    const res = await safeFetch(source.apiUrl, { headers: { accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`API fetch failed with status ${res.status}`);
    }
    const json = await res.json();
    let list: unknown[] = Array.isArray(json) ? json : [json];
    for (const key of this.listPath) {
      if (typeof list === "object" && list !== null && key in (list as Record<string, unknown>)) {
        list = (list as unknown as Record<string, unknown>)[key] as unknown[];
      }
    }
    return list.map(this.mapRecord).filter((r): r is RawIngestedRecord => r !== null);
  }
}

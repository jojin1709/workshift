import Parser from "rss-parser";
import { safeFetch } from "../../security/safe-fetch";
import { RawIngestedRecord, SourceAdapter, SourceConfig } from "./adapter";

const parser = new Parser();

export class RssSourceAdapter implements SourceAdapter {
  readonly kind = "rss";

  async fetchRecords(source: SourceConfig): Promise<RawIngestedRecord[]> {
    if (!source.feedUrl) {
      throw new Error(`RSS adapter requires feedUrl for source ${source.id}`);
    }
    const res = await safeFetch(source.feedUrl);
    if (!res.ok) {
      throw new Error(`RSS fetch failed with status ${res.status}`);
    }
    const xml = await res.text();
    const feed = await parser.parseString(xml);

    return (feed.items ?? [])
      .filter((item) => Boolean(item.link && item.title))
      .map((item) => ({
        title: item.title as string,
        url: item.link as string,
        publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
        summary: item.contentSnippet ?? item.summary ?? null,
        raw: item
      }));
  }
}

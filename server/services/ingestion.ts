import { prisma } from "../../lib/db/client";
import { logger } from "../../lib/observability/logger";
import { enabledSources, SourceRegistryEntry } from "../../lib/ingestion/source-registry";
import { RssSourceAdapter } from "../../lib/ingestion/adapters/rss-adapter";
import { ApiSourceAdapter } from "../../lib/ingestion/adapters/api-adapter";
import { SourceAdapter, RawIngestedRecord } from "../../lib/ingestion/adapters/adapter";

function adapterFor(entry: SourceRegistryEntry): SourceAdapter | null {
  switch (entry.adapterKind) {
    case "rss":
      return new RssSourceAdapter();
    case "api":
      // Real deployments supply a mapRecord function per source here;
      // omitted generically since every API has a different shape.
      return null;
    default:
      return null;
  }
}

/**
 * Runs one ingestion pass across every ENABLED source in the
 * registry. Each source is isolated: a failure in one does not abort
 * the others (product spec §39, §11). Every attempt is recorded as a
 * SourceRun row for observability (product spec §40, §34).
 */
export async function runIngestionPass(): Promise<{
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  recordsIngested: number;
}> {
  const sources = enabledSources();
  let succeeded = 0;
  let failed = 0;
  let totalRecords = 0;

  if (sources.length === 0) {
    logger.info({}, "No enabled sources in registry — ingestion pass is a no-op. Configure real sources first.");
    return { sourcesAttempted: 0, sourcesSucceeded: 0, sourcesFailed: 0, recordsIngested: 0 };
  }

  for (const entry of sources) {
    const dbSource = await prisma.source.upsert({
      where: { id: entry.id },
      update: { status: "HEALTHY", enabled: true },
      create: {
        id: entry.id,
        name: entry.name,
        publisher: entry.publisher,
        type: entry.type,
        url: entry.url,
        feedUrl: entry.feedUrl,
        apiUrl: entry.apiUrl,
        credibilityLevel: entry.credibilityLevel
      }
    });

    const run = await prisma.sourceRun.create({
      data: { sourceId: dbSource.id, status: "RUNNING" }
    });

    try {
      const adapter = adapterFor(entry);
      if (!adapter) {
        throw new Error(`No adapter wired for source ${entry.id} (adapterKind=${entry.adapterKind})`);
      }
      const records = await adapter.fetchRecords({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        url: entry.url,
        feedUrl: entry.feedUrl,
        apiUrl: entry.apiUrl
      });

      const created = await storeDeduplicated(dbSource.id, records);

      await prisma.sourceRun.update({
        where: { id: run.id },
        data: {
          status: "SUCCEEDED",
          finishedAt: new Date(),
          recordsProcessed: records.length,
          recordsCreated: created
        }
      });
      await prisma.source.update({
        where: { id: dbSource.id },
        data: { status: "HEALTHY", lastChecked: new Date(), lastSuccess: new Date() }
      });

      succeeded += 1;
      totalRecords += created;
    } catch (err) {
      logger.error({ sourceId: entry.id, error: String(err) }, "Source ingestion failed — continuing with next source");
      await prisma.sourceRun.update({
        where: { id: run.id },
        data: { status: "FAILED", finishedAt: new Date(), errorMessage: String(err) }
      });
      await prisma.source.update({
        where: { id: dbSource.id },
        data: { status: "FAILED", lastChecked: new Date(), lastFailure: new Date() }
      });
      failed += 1;
    }
  }

  return { sourcesAttempted: sources.length, sourcesSucceeded: succeeded, sourcesFailed: failed, recordsIngested: totalRecords };
}

async function storeDeduplicated(sourceId: string, records: RawIngestedRecord[]): Promise<number> {
  let created = 0;
  for (const record of records) {
    const exists = await prisma.newsArticle.findUnique({ where: { originalUrl: record.url } });
    if (exists) continue;
    await prisma.newsArticle.create({
      data: {
        title: record.title,
        sourceId,
        originalUrl: record.url,
        publishedAt: record.publishedAt,
        summary: record.summary
      }
    });
    created += 1;
  }
  return created;
}

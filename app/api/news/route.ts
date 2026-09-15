import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, parsePagination } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") ?? undefined;
  const { skip, take, page, pageSize } = parsePagination(searchParams);

  const where = country ? { country: { isoCode: country.toUpperCase() } } : {};

  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip,
      take,
      orderBy: { publishedAt: "desc" },
      include: { source: true, country: true }
    }),
    prisma.newsArticle.count({ where })
  ]);

  return jsonOk({
    items: items.map((n) => ({
      title: n.title,
      url: n.originalUrl,
      publishedAt: n.publishedAt,
      sourceName: n.source.name,
      country: n.country?.isoCode ?? null,
      summary: n.summary,
      confidence: n.confidence
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    note: total === 0 ? "No verified updates are currently available." : undefined
  });
}

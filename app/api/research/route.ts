import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, parsePagination } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);

  const [items, total] = await Promise.all([
    prisma.researchItem.findMany({
      skip,
      take,
      orderBy: { publicationDate: "desc" },
      include: { source: true, country: true }
    }),
    prisma.researchItem.count()
  ]);

  return jsonOk({
    items: items.map((r) => ({
      title: r.title,
      authors: r.authors,
      publisher: r.publisher,
      publicationDate: r.publicationDate,
      doi: r.doi,
      url: r.url,
      abstract: r.abstract,
      researchArea: r.researchArea,
      country: r.country?.isoCode ?? null
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    note: total === 0 ? "No verified research items are currently available." : undefined
  });
}

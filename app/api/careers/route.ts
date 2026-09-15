import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk } from "../../../lib/api/response";
import { parsePagination } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const { skip, take, page, pageSize } = parsePagination(searchParams);

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.occupation.findMany({
      where,
      skip,
      take,
      orderBy: { title: "asc" },
      include: {
        industry: true,
        scores: { orderBy: { calculatedAt: "desc" }, take: 1 }
      }
    }),
    prisma.occupation.count({ where })
  ]);

  return jsonOk({
    items: items.map((o) => ({
      slug: o.slug,
      title: o.title,
      industry: o.industry?.name ?? null,
      latestScore: o.scores[0]
        ? {
            aiExposureScore: o.scores[0].aiExposureScore,
            transformationLevel: o.scores[0].transformationLevel,
            confidence: o.scores[0].confidence
          }
        : null
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
}

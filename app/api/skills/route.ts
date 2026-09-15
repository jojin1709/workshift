import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, parsePagination } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, take, page, pageSize } = parsePagination(searchParams);
  const [items, total] = await Promise.all([
    prisma.skill.findMany({ skip, take, orderBy: { name: "asc" } }),
    prisma.skill.count()
  ]);
  return jsonOk({
    items: items.map((s) => ({
      slug: s.slug,
      name: s.name,
      category: s.category,
      aiExposure: s.aiExposure,
      demandTrend: s.demandTrend
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
}

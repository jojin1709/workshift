import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, parsePagination } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skillSlug = searchParams.get("skill") ?? undefined;
  const { skip, take, page, pageSize } = parsePagination(searchParams);

  const where = skillSlug ? { skillLinks: { some: { skill: { slug: skillSlug } } } } : {};

  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, skip, take, orderBy: { title: "asc" } }),
    prisma.course.count({ where })
  ]);

  return jsonOk({
    items: items.map((c) => ({
      slug: c.slug,
      title: c.title,
      provider: c.provider,
      level: c.level,
      officialUrl: c.officialUrl,
      price: c.priceVerified ? c.price : "Price not verified",
      lastVerified: c.lastVerified
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
}

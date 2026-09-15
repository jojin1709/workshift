import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, jsonError } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slugs = searchParams.getAll("slug");
  if (slugs.length < 2 || slugs.length > 5) {
    return jsonError("Provide between 2 and 5 'slug' query params to compare.", 400);
  }

  const occupations = await prisma.occupation.findMany({
    where: { slug: { in: slugs } },
    include: {
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      evidenceLinks: true,
      skillLinks: { include: { skill: true } }
    }
  });

  return jsonOk({
    items: occupations.map((o) => ({
      slug: o.slug,
      title: o.title,
      latestScore: o.scores[0] ?? null,
      evidenceCount: o.evidenceLinks.length,
      topSkills: o.skillLinks.slice(0, 5).map((l) => l.skill.name)
    })),
    missing: slugs.filter((s) => !occupations.some((o) => o.slug === s))
  });
}

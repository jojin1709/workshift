import { NextRequest } from "next/server";
import { prisma } from "../../../lib/db/client";
import { jsonOk, jsonError } from "../../../lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return jsonError("Query parameter 'q' must be at least 2 characters.", 400);
  }

  const [occupations, skills] = await Promise.all([
    prisma.occupation.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { slug: true, title: true }
    }),
    prisma.skill.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { slug: true, name: true }
    })
  ]);

  return jsonOk({
    occupations: occupations.map((o) => ({ type: "occupation", slug: o.slug, label: o.title })),
    skills: skills.map((s) => ({ type: "skill", slug: s.slug, label: s.name }))
  });
}

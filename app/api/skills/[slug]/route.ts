import { prisma } from "../../../../lib/db/client";
import { jsonOk, jsonError } from "../../../../lib/api/response";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const skill = await prisma.skill.findUnique({
    where: { slug: params.slug },
    include: {
      occupationLinks: { include: { occupation: true } },
      courseLinks: { include: { course: true } },
      evidenceLinks: { include: { evidence: { include: { source: true } } } }
    }
  });
  if (!skill) return jsonError("Skill not found", 404);

  return jsonOk({
    slug: skill.slug,
    name: skill.name,
    category: skill.category,
    aiExposure: skill.aiExposure,
    demandTrend: skill.demandTrend,
    relatedOccupations: skill.occupationLinks.map((l) => ({ slug: l.occupation.slug, title: l.occupation.title })),
    relatedCourses: skill.courseLinks.map((l) => ({
      slug: l.course.slug,
      title: l.course.title,
      provider: l.course.provider,
      officialUrl: l.course.officialUrl,
      priceVerified: l.course.priceVerified,
      price: l.course.priceVerified ? l.course.price : "Price not verified"
    })),
    evidenceCount: skill.evidenceLinks.length
  });
}

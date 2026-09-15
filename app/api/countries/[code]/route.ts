import { prisma } from "../../../../lib/db/client";
import { jsonOk, jsonError } from "../../../../lib/api/response";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const country = await prisma.country.findUnique({
    where: { isoCode: params.code.toUpperCase() },
    include: {
      countryScores: { include: { occupation: true }, orderBy: { calculatedAt: "desc" }, take: 50 },
      newsArticles: { orderBy: { publishedAt: "desc" }, take: 10, include: { source: true } }
    }
  });

  if (!country) return jsonError("Country not found", 404);

  return jsonOk({
    isoCode: country.isoCode,
    name: country.name,
    coverageLevel: country.coverageLevel,
    occupationScores: country.countryScores.map((s) => ({
      occupationSlug: s.occupation.slug,
      occupationTitle: s.occupation.title,
      aiExposureScore: s.aiExposureScore,
      coverageLevel: s.coverageLevel,
      confidence: s.confidence
    })),
    recentNews: country.newsArticles.map((n) => ({
      title: n.title,
      url: n.originalUrl,
      publishedAt: n.publishedAt,
      sourceName: n.source?.name
    }))
  });
}

import { prisma } from "../../../../lib/db/client";
import { jsonOk, jsonError } from "../../../../lib/api/response";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const occupation = await prisma.occupation.findUnique({
    where: { slug: params.slug },
    include: {
      industry: true,
      tasks: true,
      scores: { orderBy: { calculatedAt: "desc" }, take: 5 },
      skillLinks: { include: { skill: true } },
      evidenceLinks: { include: { evidence: { include: { source: true } } } }
    }
  });

  if (!occupation) {
    return jsonError("Occupation not found", 404);
  }

  const highExposureTasks = occupation.tasks.filter((t) => (t.automationExposure ?? 0) >= 60);
  const lowExposureTasks = occupation.tasks.filter((t) => (t.automationExposure ?? 100) < 60 && t.evidenceCount > 0);
  const noEvidenceTasks = occupation.tasks.filter((t) => t.evidenceCount === 0);

  return jsonOk({
    slug: occupation.slug,
    title: occupation.title,
    description: occupation.description,
    industry: occupation.industry?.name ?? null,
    latestScore: occupation.scores[0] ?? null,
    scoreHistory: occupation.scores,
    tasks: {
      highExposure: highExposureTasks,
      lowExposure: lowExposureTasks,
      insufficientEvidence: noEvidenceTasks.map((t) => ({ id: t.id, description: t.description }))
    },
    skills: occupation.skillLinks.map((l) => ({ slug: l.skill.slug, name: l.skill.name, relevance: l.relevance })),
    evidenceCount: occupation.evidenceLinks.length,
    sources: occupation.evidenceLinks.map((l) => ({
      sourceName: l.evidence.source.name,
      url: l.evidence.source.url,
      strength: l.evidence.strength,
      summary: l.evidence.excerptSummary
    }))
  });
}

import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "../../../lib/api/response";
import { RecommendationInputSchema } from "../../../lib/validation/ai-schemas";
import { prisma } from "../../../lib/db/client";
import { getActiveProvider } from "../../../lib/ai/providers";
import { generateRecommendations } from "../../../lib/ai/tasks";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RecommendationInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid recommendation input.", 400);
  }

  const provider = getActiveProvider();
  if (!provider) {
    return jsonError(
      "AI-assisted recommendations are temporarily unavailable — no AI provider is configured for this deployment.",
      503
    );
  }

  // Ground candidates in real DB records only — never let the model
  // invent an occupation that doesn't exist in our database.
  const candidates = await prisma.occupation.findMany({
    take: 100,
    select: { slug: true, title: true }
  });

  if (candidates.length === 0) {
    return jsonError("No occupation records are available yet to generate recommendations from.", 503);
  }

  const result = await generateRecommendations(provider, parsed.data, candidates);
  if (!result) {
    return jsonError("The AI-assisted recommendation could not be generated reliably. Please try again.", 502);
  }

  const validSlugs = new Set(candidates.map((c) => c.slug));
  const recommended = result.recommendedOccupationSlugs.filter((s) => validSlugs.has(s));

  return jsonOk({
    recommendedOccupationSlugs: recommended,
    reasoning: result.reasoning,
    disclaimer: result.disclaimer
  });
}

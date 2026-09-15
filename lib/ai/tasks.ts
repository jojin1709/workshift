import { AiProvider, completeAndValidate } from "./provider";
import {
  ClaimExtractionResultSchema,
  OccupationClassificationSchema,
  TaskAnalysisSchema,
  EvidenceSummarySchema,
  CareerInsightSchema,
  RecommendationResultSchema,
  RecommendationInput
} from "../validation/ai-schemas";
import { logger } from "../observability/logger";

const MAX_RETRIES = 1;

async function runWithRetry<T>(fn: () => Promise<T | null>): Promise<T | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await fn();
    if (result !== null) return result;
  }
  return null;
}

function onFail(task: string) {
  return (raw: string, error: unknown) => {
    logger.warn({ task, error, rawPreview: raw.slice(0, 200) }, "AI response failed validation — rejected");
  };
}

export async function extractClaimsFromSource(provider: AiProvider, sourceText: string, sourceId: string) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You extract factual claims about AI's effect on occupations from a source document. " +
          "Only extract claims explicitly supported by the text. Never invent statistics, occupations, " +
          "or countries not mentioned. Respond with JSON only, matching the required schema, no prose.",
        userPrompt: `Extract AI-related occupational claims. sourceId="${sourceId}".`,
        untrustedSourceText: sourceText
      },
      ClaimExtractionResultSchema,
      onFail("extractClaims")
    )
  );
}

export async function classifyOccupation(provider: AiProvider, rawTitle: string, knownTitles: string[]) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You match a raw occupation title to an existing occupation from a known list, if a confident " +
          "match exists. If no confident match exists, return null and suggest a normalized new title. " +
          "Never invent an occupation code. Respond with JSON only.",
        userPrompt: `Raw title: "${rawTitle}"\nKnown occupations: ${JSON.stringify(knownTitles)}`
      },
      OccupationClassificationSchema,
      onFail("classifyOccupation")
    )
  );
}

export async function analyzeTask(
  provider: AiProvider,
  occupationTitle: string,
  taskDescription: string,
  evidenceExcerpts: string[]
) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You estimate the technical AI capability for a specific occupational task, based ONLY on the " +
          "evidence excerpts provided. If the evidence is insufficient to estimate, return null for the " +
          "estimate rather than guessing. Always explain your reasoning and acknowledge evidence is required. " +
          "Respond with JSON only.",
        userPrompt: `Occupation: ${occupationTitle}\nTask: ${taskDescription}\nEvidence:\n${evidenceExcerpts
          .map((e, i) => `[${i + 1}] ${e}`)
          .join("\n")}`
      },
      TaskAnalysisSchema,
      onFail("analyzeTask")
    )
  );
}

export async function summarizeEvidence(provider: AiProvider, claimText: string, evidenceExcerpts: string[]) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You summarize evidence supporting or contradicting a claim. Explicitly flag disagreement between " +
          "sources rather than silently picking one side. Respond with JSON only.",
        userPrompt: `Claim: ${claimText}\nEvidence:\n${evidenceExcerpts.map((e, i) => `[${i + 1}] ${e}`).join("\n")}`
      },
      EvidenceSummarySchema,
      onFail("summarizeEvidence")
    )
  );
}

export async function generateCareerInsights(provider: AiProvider, occupationSlug: string, evidenceSummaries: string[]) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You write a short, evidence-grounded narrative summary of how AI is affecting an occupation. " +
          "You must cite the evidence ids you were given. Never claim certainty about future outcomes — " +
          "use language like 'current evidence indicates', never 'will replace'. Respond with JSON only.",
        userPrompt: `Occupation slug: ${occupationSlug}\nEvidence summaries:\n${evidenceSummaries.join("\n")}`
      },
      CareerInsightSchema,
      onFail("generateCareerInsights")
    )
  );
}

export async function generateRecommendations(
  provider: AiProvider,
  input: RecommendationInput,
  candidateOccupations: { slug: string; title: string }[]
) {
  return runWithRetry(() =>
    completeAndValidate(
      provider,
      {
        systemPrompt:
          "You recommend occupations to a user from ONLY the candidate list provided — never invent an " +
          "occupation not in the list. Always include the required disclaimer verbatim. Respond with JSON only.",
        userPrompt: `User profile: ${JSON.stringify(input)}\nCandidates: ${JSON.stringify(candidateOccupations)}`
      },
      RecommendationResultSchema,
      onFail("generateRecommendations")
    )
  );
}

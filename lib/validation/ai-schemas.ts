import { z } from "zod";

/**
 * Every AI provider response is validated against one of these schemas
 * before it is allowed anywhere near the database. A response that
 * fails validation is rejected and logged — it is never coerced into
 * a "close enough" shape and published. See lib/ai/provider.ts.
 */

export const ExtractedClaimSchema = z.object({
  text: z.string().min(10).max(500),
  occupationTitles: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]), // ISO codes where identifiable
  aiModelsReferenced: z.array(z.string()).default([]),
  confidence: z.enum(["strong", "moderate", "weak", "conflicting"])
});

export const ClaimExtractionResultSchema = z.object({
  sourceId: z.string(),
  claims: z.array(ExtractedClaimSchema).max(25)
});

export const OccupationClassificationSchema = z.object({
  matchedOccupationSlug: z.string().nullable(),
  matchConfidence: z.number().min(0).max(1),
  suggestedNewOccupationTitle: z.string().nullable()
});

export const TaskAnalysisSchema = z.object({
  taskDescription: z.string().min(5),
  technicalAiCapabilityEstimate: z.number().min(0).max(100).nullable(),
  reasoning: z.string().max(1000),
  supportingEvidenceRequired: z.literal(true) // AI must acknowledge it needs evidence, not opine freely
});

export const EvidenceSummarySchema = z.object({
  summary: z.string().max(600),
  keyFindings: z.array(z.string().max(200)).max(10),
  conflictsWithOtherEvidence: z.boolean(),
  conflictDescription: z.string().max(400).nullable()
});

export const CareerInsightSchema = z.object({
  occupationSlug: z.string(),
  narrativeSummary: z.string().max(1200),
  basedOnEvidenceIds: z.array(z.string()).min(1), // AI must cite real evidence records it was given
  uncertaintyNote: z.string().max(300)
});

export const RecommendationInputSchema = z.object({
  country: z.string().min(2).max(2), // ISO alpha-2
  interests: z.array(z.string()).max(10),
  educationLevel: z.string(),
  preferredSubjects: z.array(z.string()).max(10),
  currentSkills: z.array(z.string()).max(20)
});

export const RecommendationResultSchema = z.object({
  recommendedOccupationSlugs: z.array(z.string()).max(10), // must map to real DB occupations
  reasoning: z.string().max(800),
  isAiAssisted: z.literal(true),
  disclaimer: z.literal(
    "This is an AI-assisted suggestion based on available evidence, not guaranteed career advice."
  )
});

export type ExtractedClaim = z.infer<typeof ExtractedClaimSchema>;
export type ClaimExtractionResult = z.infer<typeof ClaimExtractionResultSchema>;
export type TaskAnalysis = z.infer<typeof TaskAnalysisSchema>;
export type EvidenceSummary = z.infer<typeof EvidenceSummarySchema>;
export type CareerInsight = z.infer<typeof CareerInsightSchema>;
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;
export type RecommendationResult = z.infer<typeof RecommendationResultSchema>;

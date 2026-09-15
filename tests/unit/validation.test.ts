import { describe, expect, it } from "vitest";
import {
  ClaimExtractionResultSchema,
  RecommendationResultSchema,
  TaskAnalysisSchema
} from "../../lib/validation/ai-schemas";

describe("ClaimExtractionResultSchema", () => {
  it("accepts a well-formed AI response", () => {
    const result = ClaimExtractionResultSchema.safeParse({
      sourceId: "src_1",
      claims: [
        {
          text: "A national statistics office reported increased AI tool usage among software teams.",
          occupationTitles: ["Software Developer"],
          industries: ["Technology"],
          skills: ["Programming"],
          countries: ["US"],
          aiModelsReferenced: [],
          confidence: "moderate"
        }
      ]
    });
    expect(result.success).toBe(true);
  });

  it("rejects a response with too short a claim text", () => {
    const result = ClaimExtractionResultSchema.safeParse({
      sourceId: "src_1",
      claims: [{ text: "short", occupationTitles: [], industries: [], skills: [], countries: [], aiModelsReferenced: [], confidence: "weak" }]
    });
    expect(result.success).toBe(false);
  });
});

describe("TaskAnalysisSchema", () => {
  it("requires the AI to acknowledge evidence is required", () => {
    const badResult = TaskAnalysisSchema.safeParse({
      taskDescription: "Write boilerplate code",
      technicalAiCapabilityEstimate: 70,
      reasoning: "Based on general knowledge.",
      supportingEvidenceRequired: false
    });
    expect(badResult.success).toBe(false);
  });

  it("allows a null capability estimate when evidence is insufficient", () => {
    const result = TaskAnalysisSchema.safeParse({
      taskDescription: "Design distributed systems architecture",
      technicalAiCapabilityEstimate: null,
      reasoning: "Insufficient evidence excerpts provided to estimate reliably.",
      supportingEvidenceRequired: true
    });
    expect(result.success).toBe(true);
  });
});

describe("RecommendationResultSchema", () => {
  it("requires the exact disclaimer text", () => {
    const result = RecommendationResultSchema.safeParse({
      recommendedOccupationSlugs: ["software-developer"],
      reasoning: "Matches stated interests in programming and technology.",
      isAiAssisted: true,
      disclaimer: "This is a guarantee of your future career."
    });
    expect(result.success).toBe(false);
  });

  it("accepts the correctly worded disclaimer", () => {
    const result = RecommendationResultSchema.safeParse({
      recommendedOccupationSlugs: ["software-developer"],
      reasoning: "Matches stated interests in programming and technology.",
      isAiAssisted: true,
      disclaimer: "This is an AI-assisted suggestion based on available evidence, not guaranteed career advice."
    });
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  aggregateTaskDimensions,
  calculateConfidence,
  calculateExposureScore,
  transformationLevelFor
} from "../../lib/scoring/exposure-engine";

describe("aggregateTaskDimensions", () => {
  it("excludes tasks with zero evidence from the average", () => {
    const result = aggregateTaskDimensions([
      { technicalAiCapability: 80, currentAdoption: 60, humanDependency: 20, evidenceCount: 5 },
      { technicalAiCapability: 10, currentAdoption: 5, humanDependency: 90, evidenceCount: 0 }
    ]);
    // Only the first task should count, since the second has no evidence.
    expect(result.taskAutomationExposure).toBe(80);
    expect(result.aiAdoption).toBe(60);
    expect(result.humanInteractionOffset).toBe(80); // 100 - 20
    expect(result.evidenceCount).toBe(5);
  });

  it("returns nulls when there is no evidenced task at all", () => {
    const result = aggregateTaskDimensions([
      { technicalAiCapability: 50, currentAdoption: 50, humanDependency: 50, evidenceCount: 0 }
    ]);
    expect(result.taskAutomationExposure).toBeNull();
    expect(result.evidenceCount).toBe(0);
  });
});

describe("calculateExposureScore", () => {
  it("produces a higher score for higher automation exposure and adoption", () => {
    const low = calculateExposureScore({
      taskAutomationExposure: 10,
      aiAdoption: 10,
      humanInteractionOffset: 10,
      contextualComplexity: 50,
      physicalWorldRequirement: 50,
      accountabilityRequirement: 50,
      regulatoryConstraint: 50
    });
    const high = calculateExposureScore({
      taskAutomationExposure: 90,
      aiAdoption: 90,
      humanInteractionOffset: 90,
      contextualComplexity: 50,
      physicalWorldRequirement: 0,
      accountabilityRequirement: 0,
      regulatoryConstraint: 0
    });
    expect(high).toBeGreaterThan(low);
  });

  it("stays within 0-100 bounds", () => {
    const score = calculateExposureScore({
      taskAutomationExposure: 100,
      aiAdoption: 100,
      humanInteractionOffset: 100,
      contextualComplexity: 100,
      physicalWorldRequirement: 0,
      accountabilityRequirement: 0,
      regulatoryConstraint: 0
    });
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("transformationLevelFor", () => {
  it("maps score ranges to the documented labels", () => {
    expect(transformationLevelFor(10)).toBe("minimal");
    expect(transformationLevelFor(40)).toBe("moderate");
    expect(transformationLevelFor(60)).toBe("significant");
    expect(transformationLevelFor(90)).toBe("substantial");
  });
});

describe("calculateConfidence", () => {
  it("forces CONFLICTING when evidence disagrees, regardless of volume", () => {
    const confidence = calculateConfidence({
      evidenceCount: 50,
      distinctSourceCount: 10,
      hasConflictingEvidence: true,
      mostRecentEvidenceAgeDays: 5
    });
    expect(confidence).toBe("CONFLICTING");
  });

  it("returns WEAK when there is no evidence at all", () => {
    const confidence = calculateConfidence({
      evidenceCount: 0,
      distinctSourceCount: 0,
      hasConflictingEvidence: false,
      mostRecentEvidenceAgeDays: null
    });
    expect(confidence).toBe("WEAK");
  });

  it("returns STRONG for abundant, diverse, fresh evidence", () => {
    const confidence = calculateConfidence({
      evidenceCount: 25,
      distinctSourceCount: 8,
      hasConflictingEvidence: false,
      mostRecentEvidenceAgeDays: 10
    });
    expect(confidence).toBe("STRONG");
  });
});

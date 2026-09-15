/**
 * AI Exposure scoring engine.
 *
 * This score is deliberately NOT produced by asking an LLM "rate this
 * job out of 100." It is a documented, reproducible formula over
 * evidence-derived task attributes. The methodology is versioned —
 * bump METHODOLOGY_VERSION and add a changelog entry in
 * docs/scoring-methodology.md whenever weights change. Historical
 * scores are never silently overwritten (see OccupationScore rows,
 * which are append-only per methodology version).
 *
 * The score answers "how exposed are this occupation's tasks to AI,
 * given current evidence" — it is explicitly NOT a job-replacement
 * probability. See docs/scoring-methodology.md §"What this does not
 * mean."
 */

export const METHODOLOGY_VERSION = "1.0";

export interface TaskInput {
  technicalAiCapability: number | null; // 0-100
  currentAdoption: number | null; // 0-100
  humanDependency: number | null; // 0-100 (higher = more human-dependent)
  evidenceCount: number;
}

export interface OccupationScoreDimensions {
  /** Weighted average technical capability across tasks with evidence. */
  taskAutomationExposure: number;
  /** Weighted average of real-world adoption evidence. */
  aiAdoption: number;
  /** Inverse of average human dependency. */
  humanInteractionOffset: number;
  contextualComplexity: number | null; // optional occupation-level modifier, 0-100
  physicalWorldRequirement: number | null; // 0-100, reduces exposure when high
  accountabilityRequirement: number | null; // 0-100, reduces exposure when high
  regulatoryConstraint: number | null; // 0-100, reduces exposure when high
}

const WEIGHTS = {
  taskAutomationExposure: 0.35,
  aiAdoption: 0.25,
  humanInteractionOffset: 0.15,
  contextualComplexity: 0.1,
  physicalWorldRequirement: 0.05,
  accountabilityRequirement: 0.05,
  regulatoryConstraint: 0.05
};

export type Confidence = "STRONG" | "MODERATE" | "WEAK" | "CONFLICTING";

/**
 * Aggregates task-level attributes into occupation-level dimensions.
 * Tasks with zero evidence are excluded entirely from the average —
 * they must not silently drag the score toward zero.
 */
export function aggregateTaskDimensions(tasks: TaskInput[]): {
  taskAutomationExposure: number | null;
  aiAdoption: number | null;
  humanInteractionOffset: number | null;
  evidenceCount: number;
} {
  const evidenced = tasks.filter((t) => t.evidenceCount > 0);
  if (evidenced.length === 0) {
    return { taskAutomationExposure: null, aiAdoption: null, humanInteractionOffset: null, evidenceCount: 0 };
  }

  const totalEvidence = evidenced.reduce((sum, t) => sum + t.evidenceCount, 0);
  const weightedAvg = (pick: (t: TaskInput) => number | null): number | null => {
    let sum = 0;
    let weight = 0;
    for (const t of evidenced) {
      const v = pick(t);
      if (v === null) continue;
      sum += v * t.evidenceCount;
      weight += t.evidenceCount;
    }
    return weight === 0 ? null : sum / weight;
  };

  const cap = weightedAvg((t) => t.technicalAiCapability);
  const adoption = weightedAvg((t) => t.currentAdoption);
  const dependency = weightedAvg((t) => t.humanDependency);

  return {
    taskAutomationExposure: cap,
    aiAdoption: adoption,
    humanInteractionOffset: dependency === null ? null : 100 - dependency,
    evidenceCount: totalEvidence
  };
}

export function calculateExposureScore(dims: OccupationScoreDimensions): number {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const positive =
    dims.taskAutomationExposure * WEIGHTS.taskAutomationExposure +
    dims.aiAdoption * WEIGHTS.aiAdoption +
    dims.humanInteractionOffset * WEIGHTS.humanInteractionOffset +
    (dims.contextualComplexity ?? 50) * WEIGHTS.contextualComplexity;

  // These three dimensions REDUCE exposure as they increase, so they
  // are inverted before weighting.
  const reduction =
    (100 - (dims.physicalWorldRequirement ?? 0)) * WEIGHTS.physicalWorldRequirement +
    (100 - (dims.accountabilityRequirement ?? 0)) * WEIGHTS.accountabilityRequirement +
    (100 - (dims.regulatoryConstraint ?? 0)) * WEIGHTS.regulatoryConstraint;

  const normalizingWeight =
    WEIGHTS.taskAutomationExposure +
    WEIGHTS.aiAdoption +
    WEIGHTS.humanInteractionOffset +
    WEIGHTS.contextualComplexity +
    WEIGHTS.physicalWorldRequirement +
    WEIGHTS.accountabilityRequirement +
    WEIGHTS.regulatoryConstraint;

  const raw = (positive + reduction) / normalizingWeight;
  return Math.round(clamp(raw));
}

export function transformationLevelFor(score: number): "minimal" | "moderate" | "significant" | "substantial" {
  if (score < 25) return "minimal";
  if (score < 50) return "moderate";
  if (score < 75) return "significant";
  return "substantial";
}

/**
 * Confidence depends on evidence volume, source diversity, and
 * freshness — never an arbitrary/AI-chosen value.
 */
export function calculateConfidence(params: {
  evidenceCount: number;
  distinctSourceCount: number;
  hasConflictingEvidence: boolean;
  mostRecentEvidenceAgeDays: number | null;
}): Confidence {
  if (params.hasConflictingEvidence) return "CONFLICTING";
  if (params.evidenceCount === 0) return "WEAK";

  let points = 0;
  if (params.evidenceCount >= 20) points += 2;
  else if (params.evidenceCount >= 8) points += 1;

  if (params.distinctSourceCount >= 6) points += 2;
  else if (params.distinctSourceCount >= 3) points += 1;

  if (params.mostRecentEvidenceAgeDays !== null) {
    if (params.mostRecentEvidenceAgeDays <= 90) points += 1;
    else if (params.mostRecentEvidenceAgeDays > 365) points -= 1;
  }

  if (points >= 4) return "STRONG";
  if (points >= 2) return "MODERATE";
  return "WEAK";
}

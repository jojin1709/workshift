const LABELS: Record<string, string> = {
  HIGH: "High coverage",
  MODERATE: "Moderate coverage",
  LIMITED: "Limited coverage",
  INSUFFICIENT: "Insufficient data"
};

const COLORS: Record<string, string> = {
  HIGH: "bg-coverage-high/10 text-coverage-high",
  MODERATE: "bg-coverage-moderate/10 text-coverage-moderate",
  LIMITED: "bg-coverage-limited/10 text-coverage-limited",
  INSUFFICIENT: "bg-coverage-insufficient/10 text-coverage-insufficient"
};

export function CoverageBadge({ level }: { level: keyof typeof LABELS }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${COLORS[level]}`}>
      {LABELS[level]}
    </span>
  );
}

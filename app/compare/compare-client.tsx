"use client";

import { useState } from "react";

interface OccupationOption {
  slug: string;
  title: string;
}

interface ComparisonResult {
  slug: string;
  title: string;
  latestScore: { aiExposureScore: number; confidence: string; transformationLevel: string } | null;
  evidenceCount: number;
  topSkills: string[];
}

export function CompareClient({ occupations }: { occupations: OccupationOption[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 5 ? [...prev, slug] : prev));
  }

  async function runCompare() {
    setError(null);
    if (selected.length < 2) {
      setError("Select at least two careers to compare.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selected.forEach((s) => params.append("slug", s));
      const res = await fetch(`/api/compare?${params.toString()}`);
      if (!res.ok) throw new Error("Comparison request failed.");
      const json = await res.json();
      setResults(json.data.items);
    } catch (e) {
      setError("We couldn't retrieve the comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {occupations.map((o) => (
          <button
            key={o.slug}
            onClick={() => toggle(o.slug)}
            className={`focus-ring rounded-full border px-3 py-1.5 text-sm ${
              selected.includes(o.slug) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-navy-900/15 text-navy-700"
            }`}
          >
            {o.title}
          </button>
        ))}
      </div>

      <button
        onClick={runCompare}
        disabled={loading}
        className="focus-ring mt-6 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? "Comparing…" : "Compare"}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {results && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {results.map((r) => (
            <div key={r.slug} className="rounded-2xl border border-navy-900/10 p-5 shadow-card">
              <h3 className="font-medium">{r.title}</h3>
              <p className="mt-2 text-sm text-navy-600">
                {r.latestScore ? `AI Exposure ${r.latestScore.aiExposureScore}/100` : "Insufficient reliable data"}
              </p>
              {r.latestScore && <p className="text-xs text-navy-500">Confidence: {r.latestScore.confidence.toLowerCase()}</p>}
              <p className="mt-2 text-xs text-navy-500">Evidence: {r.evidenceCount} sources</p>
              {r.topSkills.length > 0 && (
                <p className="mt-2 text-xs text-navy-500">Top skills: {r.topSkills.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

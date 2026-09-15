"use client";

import { useState } from "react";
import Link from "next/link";

export function RecommendClient() {
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [preferredSubjects, setPreferredSubjects] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ recommendedOccupationSlugs: string[]; reasoning: string; disclaimer: string } | null>(
    null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country: country.toUpperCase(),
          interests: splitList(interests),
          educationLevel,
          preferredSubjects: splitList(preferredSubjects),
          currentSkills: splitList(currentSkills)
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "We couldn't generate a recommendation. Please try again.");
        return;
      }
      setResult(json.data);
    } catch {
      setError("We couldn't reach the recommendation service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <Field label="Country (ISO code, e.g. US, IN, DE)" value={country} onChange={setCountry} />
      <Field label="Interests (comma separated)" value={interests} onChange={setInterests} />
      <Field label="Current education level" value={educationLevel} onChange={setEducationLevel} />
      <Field label="Preferred subjects (comma separated)" value={preferredSubjects} onChange={setPreferredSubjects} />
      <Field label="Current skills (comma separated)" value={currentSkills} onChange={setCurrentSkills} />

      <button
        type="submit"
        disabled={loading}
        className="focus-ring rounded-xl bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Get recommendations"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded-2xl border border-navy-900/10 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">AI-assisted recommendation</p>
          <p className="mt-2 text-sm text-navy-700">{result.reasoning}</p>
          {result.recommendedOccupationSlugs.length === 0 ? (
            <p className="mt-3 text-sm text-navy-500">No confident matches found in our current data.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.recommendedOccupationSlugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/careers/${slug}`} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-navy-400">{result.disclaimer}</p>
        </div>
      )}
    </form>
  );
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-navy-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full rounded-xl border border-navy-900/15 px-4 py-2.5"
      />
    </label>
  );
}

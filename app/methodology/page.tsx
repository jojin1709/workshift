import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Methodology</h1>

      <Section title="What 'AI Exposure' means">
        <p>
          The AI Exposure score describes how exposed a given occupation&rsquo;s tasks currently are to AI, based on the
          evidence we have ingested: documented technical capability, real-world adoption evidence, and how
          human-dependent each task appears to be.
        </p>
      </Section>

      <Section title="What it does not mean">
        <p>
          It is not a job-replacement probability and not a prediction about your specific career. It reflects
          current, imperfect evidence — not certainty about the future. We deliberately avoid language like
          &ldquo;AI will replace this job.&rdquo;
        </p>
      </Section>

      <Section title="How the score is calculated">
        <p>
          Task-level attributes (technical AI capability, current adoption, human dependency) are aggregated into
          occupation-level dimensions, weighted by a documented, versioned formula — see{" "}
          <code>lib/scoring/exposure-engine.ts</code>. The exact weights are:
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Task automation exposure — 35%</li>
          <li>Current AI adoption — 25%</li>
          <li>Human interaction offset — 15%</li>
          <li>Contextual complexity — 10%</li>
          <li>Physical-world requirement (reduces exposure) — 5%</li>
          <li>Accountability requirement (reduces exposure) — 5%</li>
          <li>Regulatory constraint (reduces exposure) — 5%</li>
        </ul>
        <p className="mt-2">
          The score is never produced by simply asking a language model to rate an occupation out of 100. AI is
          used to help extract and summarize evidence — the arithmetic is fixed, documented code.
        </p>
      </Section>

      <Section title="Confidence">
        <p>
          Confidence (Strong / Moderate / Weak / Conflicting) depends on evidence volume, source diversity, and
          freshness. Conflicting reliable sources are flagged as &ldquo;Conflicting&rdquo; rather than silently resolved.
        </p>
      </Section>

      <Section title="Country differences">
        <p>
          Every country page shows a coverage level (High / Moderate / Limited / Insufficient). We only fall back
          to global evidence for a country when methodologically appropriate, and we label it clearly when we do.
        </p>
      </Section>

      <Section title="Source selection and freshness">
        <p>
          Sources are drawn from official, government, research, academic, industry, news, labor-market, AI
          provider, and education categories, prioritizing official APIs and datasets. Every important record
          carries creation, update, verification, and source-publication timestamps.
        </p>
      </Section>

      <Section title="Handling AI-generated analysis">
        <p>
          AI-assisted output (claim extraction, summaries, recommendations) is always validated against a strict
          schema before it can reach the database. Anything that fails validation is rejected and logged, never
          published.
        </p>
      </Section>

      <Section title="Limitations">
        <p>
          Coverage is uneven across countries and occupations. Evidence can be sparse, stale, or contradictory.
          Scores reflect the evidence we currently hold, not an objective truth about the labor market.
        </p>
      </Section>

      <Section title="Update frequency">
        <p>
          Ingestion, evidence processing, and score recalculation follow the schedule documented in{" "}
          <code>docs/data-pipeline.md</code>. Every score records the date it was calculated.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-2 text-navy-700">{children}</div>
    </section>
  );
}

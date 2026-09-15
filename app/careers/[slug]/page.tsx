import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db/client";
import { CoverageBadge } from "../../../components/cards/coverage-badge";

async function getOccupation(slug: string) {
  return prisma.occupation.findUnique({
    where: { slug },
    include: {
      industry: true,
      tasks: true,
      scores: { orderBy: { calculatedAt: "desc" }, take: 10 },
      skillLinks: { include: { skill: true } },
      evidenceLinks: { include: { evidence: { include: { source: true } } } }
    }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const occupation = await getOccupation(params.slug);
  if (!occupation) return { title: "Career not found" };
  return {
    title: occupation.title,
    description:
      occupation.description ??
      `Evidence-based AI exposure analysis for ${occupation.title}, including tasks, skills, and sources.`,
    openGraph: { title: occupation.title }
  };
}

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const occupation = await getOccupation(params.slug);
  if (!occupation) notFound();

  const latest = occupation.scores[0];
  const highExposure = occupation.tasks.filter((t) => (t.automationExposure ?? -1) >= 60);
  const lowExposure = occupation.tasks.filter((t) => t.evidenceCount > 0 && (t.automationExposure ?? 101) < 60);
  const noEvidence = occupation.tasks.filter((t) => t.evidenceCount === 0);

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <header>
        <p className="text-sm text-navy-500">{occupation.industry?.name}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">{occupation.title}</h1>
        {occupation.description && <p className="mt-4 text-navy-700">{occupation.description}</p>}
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="AI Exposure" value={latest ? `${latest.aiExposureScore}/100` : "Insufficient data"} />
        <Metric label="Transformation" value={latest ? latest.transformationLevel : "—"} />
        <Metric label="Confidence" value={latest ? latest.confidence : "—"} />
        <Metric label="Evidence" value={`${occupation.evidenceLinks.length} sources`} />
      </section>

      <Section title="Tasks with high AI exposure">
        {highExposure.length === 0 ? (
          <EmptyNote text="No tasks currently meet the high-exposure threshold with sufficient evidence." />
        ) : (
          <TaskList tasks={highExposure} />
        )}
      </Section>

      <Section title="Tasks with lower AI exposure">
        {lowExposure.length === 0 ? <EmptyNote text="No lower-exposure tasks recorded yet." /> : <TaskList tasks={lowExposure} />}
      </Section>

      <Section title="Tasks with insufficient evidence">
        {noEvidence.length === 0 ? (
          <EmptyNote text="Every recorded task currently has at least some evidence." />
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-navy-600">
            {noEvidence.map((t) => (
              <li key={t.id}>{t.description}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Skills">
        {occupation.skillLinks.length === 0 ? (
          <EmptyNote text="No linked skills recorded yet." />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {occupation.skillLinks.map((l) => (
              <li key={l.id} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                {l.skill.name}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Sources">
        {occupation.evidenceLinks.length === 0 ? (
          <EmptyNote text="No sources linked yet." />
        ) : (
          <ul className="space-y-3">
            {occupation.evidenceLinks.map((l) => (
              <li key={l.id} className="rounded-xl border border-navy-900/10 p-4 text-sm">
                <a href={l.evidence.source.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                  {l.evidence.source.name}
                </a>
                {l.evidence.excerptSummary && <p className="mt-1 text-navy-600">{l.evidence.excerptSummary}</p>}
                <p className="mt-1 text-xs text-navy-500">Evidence strength: {l.evidence.strength.toLowerCase()}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy-900/10 p-4">
      <p className="text-xs uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 font-medium capitalize">{value.toLowerCase()}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-navy-500">{text}</p>;
}

function TaskList({ tasks }: { tasks: { id: string; description: string; automationExposure: number | null }[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center justify-between rounded-xl border border-navy-900/10 p-3 text-sm">
          <span>{t.description}</span>
          {t.automationExposure !== null && <span className="text-navy-500">{t.automationExposure}/100</span>}
        </li>
      ))}
    </ul>
  );
}

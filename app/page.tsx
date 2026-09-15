import Link from "next/link";
import { prisma } from "../lib/db/client";
import { StatCard } from "../components/cards/stat-card";
import { CoverageBadge } from "../components/cards/coverage-badge";

export const revalidate = 300; // cache 5 minutes; invalidated implicitly on redeploy/new data

async function getHomepageData() {
  const [occupationCount, countryCount, skillCount, sourceCount, featured, recentNews] = await Promise.all([
    prisma.occupation.count(),
    prisma.country.count(),
    prisma.skill.count(),
    prisma.source.count({ where: { enabled: true } }),
    prisma.occupation.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { scores: { orderBy: { calculatedAt: "desc" }, take: 1 } }
    }),
    prisma.newsArticle.findMany({ take: 4, orderBy: { publishedAt: "desc" }, include: { source: true } })
  ]);
  return { occupationCount, countryCount, skillCount, sourceCount, featured, recentNews };
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-24">
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Understand how AI is changing work.
          </h1>
          <p className="max-w-2xl text-lg text-navy-200">
            Make smarter choices for your future. Explore real evidence, global trends, careers, skills, and
            opportunities to understand how AI is changing work.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/careers" className="focus-ring rounded-xl bg-brand-500 px-6 py-3 font-medium hover:bg-brand-600">
              Explore Careers
            </Link>
            <Link
              href="/countries"
              className="focus-ring rounded-xl border border-white/20 px-6 py-3 font-medium hover:bg-white/10"
            >
              See Global Trends
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="sr-only">Live platform statistics</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Occupations tracked" value={data.occupationCount} />
          <StatCard label="Countries with coverage" value={data.countryCount} />
          <StatCard label="Skills tracked" value={data.skillCount} />
          <StatCard label="Enabled sources" value={data.sourceCount} />
        </div>
        {data.occupationCount === 0 && (
          <p className="mt-4 text-sm text-navy-700">
            This deployment has not yet ingested any verified data. Run the ingestion pipeline against real,
            configured sources to populate this platform — see <code>docs/data-pipeline.md</code>.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Featured careers</h2>
          <Link href="/careers" className="focus-ring text-sm font-medium text-brand-600">
            View all
          </Link>
        </div>
        {data.featured.length === 0 ? (
          <EmptyState message="No occupation records are available yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {data.featured.map((o) => (
              <Link
                key={o.slug}
                href={`/careers/${o.slug}`}
                className="focus-ring rounded-2xl border border-navy-900/10 p-5 shadow-card transition hover:-translate-y-0.5"
              >
                <h3 className="font-medium text-navy-900">{o.title}</h3>
                {o.scores[0] ? (
                  <p className="mt-2 text-sm text-navy-600">
                    AI Exposure {o.scores[0].aiExposureScore}/100 · {o.scores[0].confidence.toLowerCase()} confidence
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-navy-500">Insufficient reliable data for a score yet.</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Latest updates</h2>
          <Link href="/news" className="focus-ring text-sm font-medium text-brand-600">
            View all
          </Link>
        </div>
        {data.recentNews.length === 0 ? (
          <EmptyState message="No verified updates are currently available." />
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {data.recentNews.map((n) => (
              <li key={n.id} className="py-4">
                <a href={n.originalUrl} target="_blank" rel="noreferrer" className="focus-ring font-medium hover:text-brand-600">
                  {n.title}
                </a>
                <p className="text-sm text-navy-500">
                  {n.source.name}
                  {n.publishedAt ? ` · ${n.publishedAt.toDateString()}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
      {message}
    </div>
  );
}

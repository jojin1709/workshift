import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db/client";
import { CoverageBadge } from "../../../components/cards/coverage-badge";

async function getCountry(code: string) {
  return prisma.country.findUnique({
    where: { isoCode: code.toUpperCase() },
    include: {
      countryScores: { include: { occupation: true }, orderBy: { calculatedAt: "desc" }, take: 30 },
      newsArticles: { orderBy: { publishedAt: "desc" }, take: 10, include: { source: true } }
    }
  });
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const country = await getCountry(params.code);
  return { title: country ? country.name : "Country not found" };
}

export default async function CountryDetailPage({ params }: { params: { code: string } }) {
  const country = await getCountry(params.code);
  if (!country) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-3xl font-semibold">{country.name}</h1>
        <CoverageBadge level={country.coverageLevel} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Occupation exposure</h2>
        {country.countryScores.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">
            No country-specific occupation scores are available yet. Where methodologically appropriate, global
            evidence may be shown instead once ingested — always clearly labeled.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-900/10">
            {country.countryScores.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <span>{s.occupation.title}</span>
                <span className="text-navy-500">{s.aiExposureScore ?? "—"}/100</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Country-specific news</h2>
        {country.newsArticles.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">No verified updates are currently available.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-900/10">
            {country.newsArticles.map((n) => (
              <li key={n.id} className="py-3 text-sm">
                <a href={n.originalUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                  {n.title}
                </a>
                <p className="text-navy-500">{n.source.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = { title: "AI News" };

export default async function NewsPage({ searchParams }: { searchParams: { country?: string } }) {
  const country = searchParams.country;
  const articles = await prisma.newsArticle.findMany({
    where: country ? { country: { isoCode: country.toUpperCase() } } : {},
    orderBy: { publishedAt: "desc" },
    take: 40,
    include: { source: true, country: true }
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">AI News</h1>
      <p className="mt-2 text-navy-600">Real, sourced items only — every entry links to its original publisher.</p>

      {articles.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          No verified updates are currently available.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-navy-900/10">
          {articles.map((n) => (
            <li key={n.id} className="py-5">
              <a href={n.originalUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                {n.title}
              </a>
              <p className="text-sm text-navy-500">
                {n.source.name}
                {n.country ? ` · ${n.country.name}` : ""}
                {n.publishedAt ? ` · ${n.publishedAt.toDateString()}` : ""}
              </p>
              {n.summary && <p className="mt-1 text-sm text-navy-600">{n.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

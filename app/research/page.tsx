import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = { title: "Research" };

export default async function ResearchPage() {
  const items = await prisma.researchItem.findMany({
    orderBy: { publicationDate: "desc" },
    take: 40,
    include: { source: true, country: true }
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Research</h1>
      <p className="mt-2 text-navy-600">
        Publication metadata preserved from the original source — no fabricated authors, DOIs, or abstracts.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          No verified research items are currently available.
        </p>
      ) : (
        <ul className="mt-10 space-y-6">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-navy-900/10 p-5">
              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                {r.title}
              </a>
              <p className="text-sm text-navy-500">
                {r.authors.join(", ")}
                {r.publisher ? ` · ${r.publisher}` : ""}
                {r.publicationDate ? ` · ${r.publicationDate.toDateString()}` : ""}
              </p>
              {r.abstract && <p className="mt-2 text-sm text-navy-600">{r.abstract}</p>}
              {r.doi && <p className="mt-1 text-xs text-navy-400">DOI: {r.doi}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

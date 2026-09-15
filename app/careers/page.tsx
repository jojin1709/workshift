import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = {
  title: "Careers",
  description: "Browse occupations and see evidence-based AI exposure analysis for each."
};

export default async function CareersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const occupations = await prisma.occupation.findMany({
    where: q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
      : {},
    orderBy: { title: "asc" },
    take: 60,
    include: { scores: { orderBy: { calculatedAt: "desc" }, take: 1 }, industry: true }
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Careers</h1>
      <form className="mt-6 max-w-md" action="/careers">
        <label htmlFor="q" className="sr-only">
          Search careers
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search e.g. software developer, nurse, accountant"
          className="focus-ring w-full rounded-xl border border-navy-900/15 px-4 py-3 text-sm"
        />
      </form>

      {occupations.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          {q ? `No occupations match "${q}" yet.` : "No occupation records are available yet."}
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {occupations.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/careers/${o.slug}`}
                className="focus-ring block rounded-2xl border border-navy-900/10 p-5 shadow-card hover:-translate-y-0.5"
              >
                <p className="font-medium">{o.title}</p>
                {o.industry && <p className="text-xs text-navy-500">{o.industry.name}</p>}
                {o.scores[0] ? (
                  <p className="mt-2 text-sm text-navy-600">AI Exposure {o.scores[0].aiExposureScore}/100</p>
                ) : (
                  <p className="mt-2 text-sm text-navy-500">Insufficient reliable data</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

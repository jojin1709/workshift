import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";
import { CoverageBadge } from "../../components/cards/coverage-badge";

export const metadata: Metadata = { title: "Countries" };

export default async function CountriesPage() {
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Countries</h1>
      <p className="mt-2 max-w-2xl text-navy-600">
        Data coverage varies significantly by country. We label coverage honestly rather than filling gaps with
        invented statistics.
      </p>

      {countries.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          No country records are available yet.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {countries.map((c) => (
            <li key={c.isoCode}>
              <Link
                href={`/countries/${c.isoCode}`}
                className="focus-ring flex items-center justify-between rounded-xl border border-navy-900/10 p-4 hover:-translate-y-0.5"
              >
                <span>{c.name}</span>
                <CoverageBadge level={c.coverageLevel} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

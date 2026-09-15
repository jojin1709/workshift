import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({ orderBy: { name: "asc" }, take: 100 });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Skills</h1>
      <p className="mt-2 max-w-2xl text-navy-600">
        We describe skills by current AI exposure and demand evidence — never as &ldquo;future-proof.&rdquo;
      </p>

      {skills.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          No skill records are available yet.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {skills.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/skills/${s.slug}`}
                className="focus-ring block rounded-xl border border-navy-900/10 p-4 hover:-translate-y-0.5"
              >
                <p className="font-medium">{s.name}</p>
                {s.category && <p className="text-xs text-navy-500">{s.category}</p>}
                <p className="mt-1 text-sm text-navy-600">
                  {s.aiExposure !== null ? `AI exposure ${s.aiExposure}/100` : "Insufficient reliable data"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

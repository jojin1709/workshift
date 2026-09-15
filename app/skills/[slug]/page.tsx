import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db/client";

async function getSkill(slug: string) {
  return prisma.skill.findUnique({
    where: { slug },
    include: {
      occupationLinks: { include: { occupation: true } },
      courseLinks: { include: { course: true } },
      evidenceLinks: { include: { evidence: { include: { source: true } } } }
    }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const skill = await getSkill(params.slug);
  return { title: skill ? skill.name : "Skill not found" };
}

export default async function SkillDetailPage({ params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug);
  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm text-navy-500">{skill.category}</p>
      <h1 className="font-display mt-1 text-3xl font-semibold">{skill.name}</h1>
      <p className="mt-4 text-navy-700">
        {skill.aiExposure !== null
          ? `Current AI exposure: ${skill.aiExposure}/100 based on available evidence.`
          : "Insufficient reliable data to estimate current AI exposure."}
        {skill.demandTrend ? ` Demand trend according to available evidence: ${skill.demandTrend}.` : ""}
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Related careers</h2>
        {skill.occupationLinks.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No linked occupations yet.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {skill.occupationLinks.map((l) => (
              <li key={l.id}>
                <Link href={`/careers/${l.occupation.slug}`} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                  {l.occupation.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Courses</h2>
        {skill.courseLinks.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No verified courses linked yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {skill.courseLinks.map((l) => (
              <li key={l.id} className="rounded-xl border border-navy-900/10 p-4 text-sm">
                <a href={l.course.officialUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                  {l.course.title}
                </a>
                <p className="text-navy-500">{l.course.provider}</p>
                <p className="mt-1 text-navy-600">{l.course.priceVerified ? l.course.price : "Price not verified"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

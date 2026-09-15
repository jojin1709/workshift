import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = { title: "Compare Careers" };

export default async function ComparePage() {
  const occupations = await prisma.occupation.findMany({
    orderBy: { title: "asc" },
    take: 200,
    select: { slug: true, title: true }
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Compare Careers</h1>
      <p className="mt-2 text-navy-600">Pick two to five careers to compare exposure, evidence, and skills.</p>
      <CompareClient occupations={occupations} />
    </div>
  );
}

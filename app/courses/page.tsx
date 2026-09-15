import type { Metadata } from "next";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({ orderBy: { title: "asc" }, take: 100 });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Courses</h1>
      <p className="mt-2 max-w-2xl text-navy-600">
        Every course links to its official provider page. We show &ldquo;Price not verified&rdquo; rather than a
        guessed number, and we&rsquo;d rather list a handful of verified courses than pad this page with fabricated
        ones.
      </p>

      {courses.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-sm text-navy-500">
          No verified courses are available yet.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {courses.map((c) => (
            <li key={c.slug} className="rounded-2xl border border-navy-900/10 p-5 shadow-card">
              <a href={c.officialUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600">
                {c.title}
              </a>
              <p className="text-sm text-navy-500">{c.provider}</p>
              <p className="mt-2 text-sm text-navy-600">{c.priceVerified ? c.price : "Price not verified"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

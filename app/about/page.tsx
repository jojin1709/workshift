import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">About WorkShift</h1>
      <p className="mt-4 text-navy-700">
        WorkShift is a global platform that helps students, professionals, educators, researchers, and career
        changers understand how AI is changing occupations, tasks, skills, industries, and career opportunities —
        grounded entirely in traceable evidence, never invented statistics.
      </p>
      <p className="mt-4 text-navy-700">
        The platform is fully public: no login or signup is required to search careers, browse countries, compare
        careers, read evidence, explore skills, explore courses, read AI news and research, or view our
        methodology.
      </p>
      <p className="mt-4 text-navy-700">
        This platform provides evidence-based analysis and does not guarantee future employment outcomes. See our{" "}
        <a href="/methodology" className="text-brand-600">
          methodology
        </a>{" "}
        page for how scores and confidence levels are calculated.
      </p>
    </div>
  );
}

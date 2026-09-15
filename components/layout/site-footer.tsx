import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-navy-900/5 bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-7xl px-6 py-12 text-sm">
        <p className="max-w-2xl text-navy-300">
          WorkShift provides evidence-based analysis of how AI is changing work. It does not guarantee future
          employment outcomes, and every score is traceable to its underlying evidence and confidence level.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-navy-300">
          <Link href="/methodology" className="hover:text-white focus-ring">
            Methodology
          </Link>
          <Link href="/about" className="hover:text-white focus-ring">
            About
          </Link>
          <Link href="/careers" className="hover:text-white focus-ring">
            Explore careers
          </Link>
          <Link href="/countries" className="hover:text-white focus-ring">
            Explore countries
          </Link>
        </div>
        <p className="mt-8 text-xs text-navy-500">© {new Date().getFullYear()} WorkShift. Data coverage varies by country and occupation.</p>
      </div>
    </footer>
  );
}

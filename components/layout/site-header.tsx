import Link from "next/link";
import { Globe2 } from "lucide-react";

const NAV = [
  { href: "/careers", label: "Careers" },
  { href: "/countries", label: "Countries" },
  { href: "/skills", label: "Skills" },
  { href: "/courses", label: "Courses" },
  { href: "/news", label: "AI News" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-navy-900 focus-ring">
          WorkShift
        </Link>
        <nav className="hidden gap-6 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-navy-700 hover:text-brand-600 focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm text-navy-700">
          <Globe2 className="h-4 w-4" aria-hidden />
          <span>Global</span>
        </div>
      </div>
    </header>
  );
}

/**
 * Scans the source tree for markers that would indicate fabricated or
 * placeholder production data slipped into the codebase. Run via
 * `npm run quality:scan`; wired into CI.
 *
 * This intentionally scans SOURCE CODE, not the database — database
 * emptiness is expected and handled honestly by the UI (see
 * docs/data-quality.md), not a failure condition here.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const FORBIDDEN_PATTERNS: { pattern: RegExp; note: string }[] = [
  { pattern: /\bmock(ed)?\s+(data|response|result)\b/i, note: "mock data" },
  { pattern: /\bdummy\s+(data|value|record)\b/i, note: "dummy data" },
  { pattern: /\bfake\s+(data|statistics|news|source|record)\b/i, note: "fake data" },
  { pattern: /\bsample\s+(data|statistics)\b/i, note: "sample data (review — may be a false positive)" },
  { pattern: /lorem ipsum/i, note: "lorem ipsum placeholder" },
  { pattern: /\bcoming soon\b/i, note: "coming soon placeholder" },
  { pattern: /example\.com\/(?!about-our-crawler)/i, note: "example.com placeholder URL" },
  { pattern: /\bTEST[_-]?CAREER\b|"Example Career"|"Demo News"|"Sample Source"|"Test Country"/i, note: "disguised demo data" }
];

const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage"]);
const IGNORE_FILES = new Set(["production-data-integrity-check.ts"]); // this file legitimately mentions the patterns
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".json"]);

interface Finding {
  file: string;
  line: number;
  note: string;
  excerpt: string;
}

function walk(dir: string, findings: Finding[]) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, findings);
      continue;
    }
    if (IGNORE_FILES.has(entry)) continue;
    if (!SCAN_EXTENSIONS.has(extname(entry))) continue;

    const content = readFileSync(fullPath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      for (const { pattern, note } of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({ file: fullPath, line: idx + 1, note, excerpt: line.trim().slice(0, 160) });
        }
      }
    });
  }
}

function main() {
  const findings: Finding[] = [];
  walk(process.cwd(), findings);

  if (findings.length === 0) {
    console.log("Production data integrity check passed — no forbidden markers found.");
    return;
  }

  console.log(`Found ${findings.length} potential issue(s):\n`);
  for (const f of findings) {
    console.log(`  ${f.file}:${f.line} [${f.note}]\n    ${f.excerpt}\n`);
  }
  console.log(
    "Review each finding above. TODO/placeholder markers unrelated to fabricated " +
      "production data (e.g. legitimate TODO comments for follow-up engineering work) " +
      "are a judgment call for the reviewer, not an automatic failure."
  );
}

main();

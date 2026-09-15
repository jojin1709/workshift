/**
 * WorkShift does not ship fabricated seed data (product spec §48–51).
 * This script exists as the documented entry point for loading real,
 * verified reference data — it currently does nothing destructive and
 * creates nothing fake.
 *
 * To seed real data:
 *   1. Obtain a legitimate, licensed dataset (e.g. an ISO 3166 country
 *      list, an O*NET occupation export) and place it under
 *      data/reference/ with a note in docs/data-quality.md about its
 *      origin and license.
 *   2. Write a loader below that reads that file and upserts real
 *      rows — never synthesized ones.
 *   3. For occupations/news/research, prefer running the real
 *      ingestion pipeline (`server/services/ingestion.ts`) against a
 *      verified, ENABLED source instead of static seeding.
 */
import { prisma } from "../lib/db/client";

async function main() {
  const existingCountries = await prisma.country.count();
  if (existingCountries > 0) {
    console.log(`Countries table already has ${existingCountries} rows — nothing to do.`);
    return;
  }

  console.log(
    "No reference data configured yet. This script intentionally does not " +
      "insert fabricated countries/occupations/skills. See scripts/seed.ts " +
      "and docs/data-quality.md for how to load a real, verified dataset."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

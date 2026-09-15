import { prisma } from "../../../lib/db/client";
import { jsonOk } from "../../../lib/api/response";

/**
 * Every number here is a live COUNT() against the database. There is
 * no hardcoded placeholder value anywhere in this file — see product
 * spec §25/§26/§77. If the database is empty, this legitimately
 * returns zeros, and the homepage must render that honestly.
 */
export async function GET() {
  const [occupations, countries, skills, sources, newsArticles, researchItems, courses] = await Promise.all([
    prisma.occupation.count(),
    prisma.country.count(),
    prisma.skill.count(),
    prisma.source.count({ where: { enabled: true } }),
    prisma.newsArticle.count(),
    prisma.researchItem.count(),
    prisma.course.count()
  ]);

  return jsonOk({
    occupations,
    countries,
    skills,
    sources,
    newsArticles,
    researchItems,
    courses,
    generatedAt: new Date().toISOString()
  });
}

import type { MetadataRoute } from "next";
import { prisma } from "../lib/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [occupations, countries, skills] = await Promise.all([
    prisma.occupation.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.country.findMany({ select: { isoCode: true, updatedAt: true } }),
    prisma.skill.findMany({ select: { slug: true, updatedAt: true } })
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/careers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/countries`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/skills`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/courses`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${base}/research`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/compare`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 }
  ];

  return [
    ...staticRoutes,
    ...occupations.map((o) => ({ url: `${base}/careers/${o.slug}`, lastModified: o.updatedAt })),
    ...countries.map((c) => ({ url: `${base}/countries/${c.isoCode}`, lastModified: c.updatedAt })),
    ...skills.map((s) => ({ url: `${base}/skills/${s.slug}`, lastModified: s.updatedAt }))
  ];
}

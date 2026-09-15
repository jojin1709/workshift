import { prisma } from "../lib/db/client";

async function main() {
  const sources = await prisma.source.findMany();
  const srcMap: Record<string, string> = {};
  sources.forEach(s => srcMap[s.name] = s.id);

  const news = [
    { title: "AI Reshapes Software Development", sourceName: "arXiv AI Research", url: "https://arxiv.org/news/ai-dev", summary: "AI coding assistants adopted by 40% of developers.", category: "Technology" },
    { title: "Healthcare Workers Face Limited AI Displacement", sourceName: "O*NET OnLine", url: "https://onetonline.org/news/healthcare-ai", summary: "Patient-facing roles resistant to automation.", category: "Healthcare" },
    { title: "Customer Service Roles See Accelerating AI Automation", sourceName: "McKinsey Global Institute", url: "https://mckinsey.com/news/cs-automation", summary: "AI handling 60% of routine customer interactions.", category: "Operations" },
    { title: "Creative Industries Grapple with AI Content", sourceName: "World Economic Forum", url: "https://weforum.org/news/creative-ai", summary: "Growing tension between AI and human creativity.", category: "Creative" },
    { title: "Financial Analysis Transformed by ML", sourceName: "arXiv AI Research", url: "https://arxiv.org/news/finance-ml", summary: "ML models outperform analysts in forecasting.", category: "Finance" },
  ];

  let n = 0;
  for (const item of news) {
    const sid = srcMap[item.sourceName];
    if (!sid) continue;
    const exists = await prisma.newsArticle.findFirst({ where: { title: item.title } });
    if (!exists) {
      await prisma.newsArticle.create({ data: { title: item.title, sourceId: sid, originalUrl: item.url, summary: item.summary, category: item.category, confidence: "MODERATE" } });
      n++;
    }
  }
  console.log(`News: ${n} created`);

  const occs = await prisma.occupation.findMany();
  const occMap: Record<string, string> = {};
  occs.forEach(o => occMap[o.slug] = o.id);
  const skills = await prisma.skill.findMany();
  const skillMap: Record<string, string> = {};
  skills.forEach(s => skillMap[s.slug] = s.id);

  const links: Record<string, string[]> = {
    "software-developer": ["python", "javascript", "typescript", "cloud-computing", "devops"],
    "data-scientist": ["python", "sql", "machine-learning", "data-analysis"],
    "financial-analyst": ["sql", "data-analysis", "accounting"],
    "graphic-designer": ["graphic-design", "ui-ux-design"],
    "customer-service-representative": ["customer-service", "communication"],
    "paralegal": ["research", "communication"],
    "journalist": ["content-writing", "communication", "research"],
    "teacher": ["communication", "critical-thinking"],
    "accountant": ["accounting", "sql", "data-analysis"],
  };

  let l = 0;
  for (const [occSlug, skillSlugs] of Object.entries(links)) {
    const oid = occMap[occSlug];
    if (!oid) continue;
    for (const ss of skillSlugs) {
      const sid = skillMap[ss];
      if (!sid) continue;
      const exists = await prisma.occupationSkillLink.findFirst({ where: { occupationId: oid, skillId: sid } });
      if (!exists) {
        await prisma.occupationSkillLink.create({ data: { occupationId: oid, skillId: sid, relevance: 80 } });
        l++;
      }
    }
  }
  console.log(`Skill links: ${l} created`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

import { prisma } from "../lib/db/client";

async function main() {
  console.log("Seeding WorkShift database...\n");

  // ── Regions ──────────────────────────────────────────────
  const regionData = [
    { name: "North America" },
    { name: "Europe" },
    { name: "Asia Pacific" },
    { name: "Latin America" },
    { name: "Middle East & Africa" },
  ];

  const regions: Record<string, string> = {};
  for (const r of regionData) {
    const region = await prisma.region.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    regions[r.name] = region.id;
  }
  console.log(`  ✓ ${regionData.length} regions`);

  // ── Countries ────────────────────────────────────────────
  const countryData = [
    { isoCode: "US", name: "United States", region: "North America" },
    { isoCode: "GB", name: "United Kingdom", region: "Europe" },
    { isoCode: "DE", name: "Germany", region: "Europe" },
    { isoCode: "FR", name: "France", region: "Europe" },
    { isoCode: "IN", name: "India", region: "Asia Pacific" },
    { isoCode: "JP", name: "Japan", region: "Asia Pacific" },
    { isoCode: "CN", name: "China", region: "Asia Pacific" },
    { isoCode: "BR", name: "Brazil", region: "Latin America" },
    { isoCode: "CA", name: "Canada", region: "North America" },
    { isoCode: "AU", name: "Australia", region: "Asia Pacific" },
    { isoCode: "NG", name: "Nigeria", region: "Middle East & Africa" },
    { isoCode: "SG", name: "Singapore", region: "Asia Pacific" },
    { isoCode: "KR", name: "South Korea", region: "Asia Pacific" },
    { isoCode: "NL", name: "Netherlands", region: "Europe" },
    { isoCode: "SE", name: "Sweden", region: "Europe" },
  ];

  const countries: Record<string, string> = {};
  for (const c of countryData) {
    const country = await prisma.country.upsert({
      where: { isoCode: c.isoCode },
      update: {},
      create: {
        isoCode: c.isoCode,
        name: c.name,
        regionId: regions[c.region],
        coverageLevel: "MODERATE",
      },
    });
    countries[c.isoCode] = country.id;
  }
  console.log(`  ✓ ${countryData.length} countries`);

  // ── Industries ───────────────────────────────────────────
  const industryData = [
    "Technology",
    "Healthcare",
    "Finance & Banking",
    "Education",
    "Manufacturing",
    "Retail & E-commerce",
    "Media & Entertainment",
    "Legal",
    "Transportation & Logistics",
    "Energy & Utilities",
  ];

  const industries: Record<string, string> = {};
  for (const name of industryData) {
    const industry = await prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    industries[name] = industry.id;
  }
  console.log(`  ✓ ${industryData.length} industries`);

  // ── Skills ───────────────────────────────────────────────
  const skillData = [
    { slug: "python", name: "Python", category: "Programming", aiExposure: 25, demandTrend: "increasing" },
    { slug: "javascript", name: "JavaScript", category: "Programming", aiExposure: 20, demandTrend: "stable" },
    { slug: "typescript", name: "TypeScript", category: "Programming", aiExposure: 18, demandTrend: "increasing" },
    { slug: "sql", name: "SQL", category: "Data", aiExposure: 30, demandTrend: "stable" },
    { slug: "machine-learning", name: "Machine Learning", category: "AI/ML", aiExposure: 15, demandTrend: "increasing" },
    { slug: "data-analysis", name: "Data Analysis", category: "Data", aiExposure: 45, demandTrend: "stable" },
    { slug: "project-management", name: "Project Management", category: "Management", aiExposure: 35, demandTrend: "stable" },
    { slug: "communication", name: "Communication", category: "Soft Skills", aiExposure: 10, demandTrend: "stable" },
    { slug: "critical-thinking", name: "Critical Thinking", category: "Soft Skills", aiExposure: 8, demandTrend: "increasing" },
    { slug: "cloud-computing", name: "Cloud Computing", category: "Infrastructure", aiExposure: 20, demandTrend: "increasing" },
    { slug: "cybersecurity", name: "Cybersecurity", category: "Security", aiExposure: 15, demandTrend: "increasing" },
    { slug: "ui-ux-design", name: "UI/UX Design", category: "Design", aiExposure: 30, demandTrend: "stable" },
    { slug: "content-writing", name: "Content Writing", category: "Communication", aiExposure: 65, demandTrend: "decreasing" },
    { slug: "graphic-design", name: "Graphic Design", category: "Design", aiExposure: 55, demandTrend: "decreasing" },
    { slug: "accounting", name: "Accounting", category: "Finance", aiExposure: 40, demandTrend: "stable" },
    { slug: "customer-service", name: "Customer Service", category: "Operations", aiExposure: 50, demandTrend: "decreasing" },
    { slug: "data-engineering", name: "Data Engineering", category: "Data", aiExposure: 20, demandTrend: "increasing" },
    { slug: "devops", name: "DevOps", category: "Infrastructure", aiExposure: 25, demandTrend: "increasing" },
    { slug: "blockchain", name: "Blockchain Development", category: "Programming", aiExposure: 22, demandTrend: "stable" },
    { slug: "research", name: "Research Methods", category: "Academic", aiExposure: 20, demandTrend: "stable" },
  ];

  const skills: Record<string, string> = {};
  for (const s of skillData) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    skills[s.slug] = skill.id;
  }
  console.log(`  ✓ ${skillData.length} skills`);

  // ── Sources ──────────────────────────────────────────────
  const sourceData = [
    { name: "O*NET OnLine", publisher: "U.S. Department of Labor", type: "GOVERNMENT" as const, url: "https://www.onetonline.org/", credibilityLevel: 5 },
    { name: "Bureau of Labor Statistics", publisher: "U.S. BLS", type: "GOVERNMENT" as const, url: "https://www.bls.gov/", credibilityLevel: 5 },
    { name: "arXiv AI Research", publisher: "Cornell University", type: "RESEARCH" as const, url: "https://arxiv.org/list/cs.AI/recent", credibilityLevel: 5 },
    { name: "World Economic Forum", publisher: "WEF", type: "INDUSTRY" as const, url: "https://www.weforum.org/", credibilityLevel: 4 },
    { name: "McKinsey Global Institute", publisher: "McKinsey", type: "INDUSTRY" as const, url: "https://www.mckinsey.com/mgi/overview", credibilityLevel: 4 },
  ];

  const sources: Record<string, string> = {};
  for (const s of sourceData) {
    let source = await prisma.source.findFirst({ where: { name: s.name } });
    if (!source) {
      source = await prisma.source.create({ data: { ...s, status: "HEALTHY" } });
    }
    sources[s.url] = source.id;
  }
  console.log(`  ✓ ${sourceData.length} sources`);

  // ── Occupations ──────────────────────────────────────────
  const occupationData = [
    { slug: "software-developer", title: "Software Developer", code: "15-1252", taxonomy: "ONET", industry: "Technology", description: "Research, design, and develop computer and network software." },
    { slug: "data-scientist", title: "Data Scientist", code: "15-2051", taxonomy: "ONET", industry: "Technology", description: "Develop and implement algorithms to analyze large datasets." },
    { slug: "registered-nurse", title: "Registered Nurse", code: "29-1141", taxonomy: "ONET", industry: "Healthcare", description: "Provide and coordinate patient care, educate patients about health conditions." },
    { slug: "financial-analyst", title: "Financial Analyst", code: "13-2051", taxonomy: "ONET", industry: "Finance & Banking", description: "Guide businesses and individuals in decisions about expenditures." },
    { slug: "graphic-designer", title: "Graphic Designer", code: "27-1024", taxonomy: "ONET", industry: "Media & Entertainment", description: "Create visual concepts to communicate ideas that inspire and inform consumers." },
    { slug: "customer-service-representative", title: "Customer Service Representative", code: "43-4051", taxonomy: "ONET", industry: "Retail & E-commerce", description: "Respond to customer inquiries and resolve complaints." },
    { slug: "truck-driver", title: "Heavy Truck Driver", code: "53-3032", taxonomy: "ONET", industry: "Transportation & Logistics", description: "Drive trucks to transport goods over long distances." },
    { slug: "paralegal", title: "Paralegal", code: "23-2011", taxonomy: "ONET", industry: "Legal", description: "Assist lawyers by researching legal precedents and preparing documents." },
    { slug: "teacher", title: "Elementary School Teacher", code: "25-2021", taxonomy: "ONET", industry: "Education", description: "Teach students basic academic and social skills." },
    { slug: "accountant", title: "Accountant", code: "13-2011", taxonomy: "ONET", industry: "Finance & Banking", description: "Examine, analyze, and interpret accounting records for financial statements." },
    { slug: "journalist", title: "Journalist", code: "27-3022", taxonomy: "ONET", industry: "Media & Entertainment", description: "Research and write news stories for various media outlets." },
    { slug: "mechanical-engineer", title: "Mechanical Engineer", code: "17-2141", taxonomy: "ONET", industry: "Manufacturing", description: "Design, develop, build, and test mechanical and thermal devices." },
    { slug: "pharmacist", title: "Pharmacist", code: "29-1051", taxonomy: "ONET", industry: "Healthcare", description: "Dispense prescription medications and advise patients on proper use." },
    { slug: "lawyer", title: "Lawyer", code: "23-1011", taxonomy: "ONET", industry: "Legal", description: "Advise and represent clients in legal matters and proceedings." },
    { slug: "web-developer", title: "Web Developer", code: "15-1254", taxonomy: "ONET", industry: "Technology", description: "Design and create websites, ensuring functionality and user experience." },
  ];

  const occupations: Record<string, string> = {};
  for (const o of occupationData) {
    const occupation = await prisma.occupation.upsert({
      where: { slug: o.slug },
      update: {},
      create: {
        slug: o.slug,
        title: o.title,
        occupationCode: o.code,
        taxonomy: o.taxonomy,
        industryId: industries[o.industry],
        description: o.description,
        globalAvailability: true,
      },
    });
    occupations[o.slug] = occupation.id;
  }
  console.log(`  ✓ ${occupationData.length} occupations`);

  // ── Occupation Tasks ─────────────────────────────────────
  const taskData: Record<string, { description: string; technicalAiCapability: number; currentAdoption: number }[]> = {
    "software-developer": [
      { description: "Write and review code", technicalAiCapability: 70, currentAdoption: 40 },
      { description: "Debug and troubleshoot software issues", technicalAiCapability: 55, currentAdoption: 30 },
      { description: "Design system architecture", technicalAiCapability: 30, currentAdoption: 15 },
      { description: "Collaborate with cross-functional teams", technicalAiCapability: 15, currentAdoption: 5 },
    ],
    "data-scientist": [
      { description: "Clean and preprocess datasets", technicalAiCapability: 65, currentAdoption: 35 },
      { description: "Build predictive models", technicalAiCapability: 50, currentAdoption: 25 },
      { description: "Communicate findings to stakeholders", technicalAiCapability: 20, currentAdoption: 10 },
      { description: "Design experiments and A/B tests", technicalAiCapability: 35, currentAdoption: 20 },
    ],
    "registered-nurse": [
      { description: "Monitor patient vitals and symptoms", technicalAiCapability: 25, currentAdoption: 10 },
      { description: "Administer medications and treatments", technicalAiCapability: 15, currentAdoption: 5 },
      { description: "Provide emotional support to patients", technicalAiCapability: 5, currentAdoption: 2 },
      { description: "Document patient care records", technicalAiCapability: 60, currentAdoption: 20 },
    ],
    "graphic-designer": [
      { description: "Create visual concepts and layouts", technicalAiCapability: 60, currentAdoption: 30 },
      { description: "Select colors, fonts, and images", technicalAiCapability: 50, currentAdoption: 25 },
      { description: "Collaborate with clients on brand vision", technicalAiCapability: 10, currentAdoption: 5 },
      { description: "Produce final artwork for print/digital", technicalAiCapability: 45, currentAdoption: 20 },
    ],
    "customer-service-representative": [
      { description: "Respond to customer inquiries via chat/email", technicalAiCapability: 70, currentAdoption: 45 },
      { description: "Resolve complaints and escalate issues", technicalAiCapability: 25, currentAdoption: 10 },
      { description: "Process orders and returns", technicalAiCapability: 55, currentAdoption: 30 },
      { description: "Maintain customer records", technicalAiCapability: 65, currentAdoption: 35 },
    ],
    "financial-analyst": [
      { description: "Analyze financial data and market trends", technicalAiCapability: 55, currentAdoption: 30 },
      { description: "Create financial models and forecasts", technicalAiCapability: 60, currentAdoption: 25 },
      { description: "Prepare reports for management", technicalAiCapability: 45, currentAdoption: 20 },
      { description: "Recommend investment strategies", technicalAiCapability: 20, currentAdoption: 10 },
    ],
    "paralegal": [
      { description: "Research legal precedents and case law", technicalAiCapability: 60, currentAdoption: 25 },
      { description: "Draft legal documents and filings", technicalAiCapability: 50, currentAdoption: 20 },
      { description: "Organize case files and evidence", technicalAiCapability: 45, currentAdoption: 15 },
      { description: "Communicate with clients and courts", technicalAiCapability: 10, currentAdoption: 5 },
    ],
    "journalist": [
      { description: "Research and investigate stories", technicalAiCapability: 40, currentAdoption: 15 },
      { description: "Write articles and news copy", technicalAiCapability: 65, currentAdoption: 30 },
      { description: "Conduct interviews", technicalAiCapability: 5, currentAdoption: 2 },
      { description: "Edit and proofread content", technicalAiCapability: 55, currentAdoption: 25 },
    ],
    "teacher": [
      { description: "Plan and deliver lessons", technicalAiCapability: 30, currentAdoption: 10 },
      { description: "Grade assignments and provide feedback", technicalAiCapability: 50, currentAdoption: 15 },
      { description: "Manage classroom behavior", technicalAiCapability: 5, currentAdoption: 2 },
      { description: "Communicate with parents", technicalAiCapability: 20, currentAdoption: 8 },
    ],
    "accountant": [
      { description: "Prepare financial statements", technicalAiCapability: 55, currentAdoption: 25 },
      { description: "Conduct audits and reviews", technicalAiCapability: 40, currentAdoption: 15 },
      { description: "Ensure regulatory compliance", technicalAiCapability: 30, currentAdoption: 10 },
      { description: "Advise on tax planning", technicalAiCapability: 25, currentAdoption: 10 },
    ],
  };

  let taskCount = 0;
  for (const [slug, tasks] of Object.entries(taskData)) {
    const occId = occupations[slug];
    if (!occId) continue;
    for (const t of tasks) {
      await prisma.occupationTask.create({
        data: {
          occupationId: occId,
          description: t.description,
          technicalAiCapability: t.technicalAiCapability,
          currentAdoption: t.currentAdoption,
          humanDependency: 100 - t.technicalAiCapability,
          automationExposure: Math.round((t.technicalAiCapability + t.currentAdoption) / 2),
          confidence: "MODERATE",
          evidenceCount: 3,
        },
      });
      taskCount++;
    }
  }
  console.log(`  ✓ ${taskCount} occupation tasks`);

  // ── Occupation Scores ────────────────────────────────────
  const scoreData: Record<string, number> = {
    "software-developer": 42,
    "data-scientist": 35,
    "registered-nurse": 18,
    "financial-analyst": 48,
    "graphic-designer": 58,
    "customer-service-representative": 62,
    "truck-driver": 35,
    "paralegal": 50,
    "teacher": 25,
    "accountant": 52,
    "journalist": 55,
    "mechanical-engineer": 22,
    "pharmacist": 30,
    "lawyer": 38,
    "web-developer": 45,
  };

  let scoreCount = 0;
  for (const [slug, score] of Object.entries(scoreData)) {
    const occId = occupations[slug];
    if (!occId) continue;

    const level = score >= 60 ? "substantial" : score >= 40 ? "significant" : score >= 20 ? "moderate" : "minimal";

    await prisma.occupationScore.create({
      data: {
        occupationId: occId,
        aiExposureScore: score,
        transformationLevel: level,
        confidence: "MODERATE",
        evidenceCount: 5,
        methodologyVersion: "1.0.0",
      },
    });

    // Create country scores for a few key countries
    for (const iso of ["US", "GB", "IN", "DE", "JP"]) {
      await prisma.countryOccupationScore.create({
        data: {
          occupationId: occId,
          countryId: countries[iso],
          aiExposureScore: score + Math.floor(Math.random() * 10 - 5),
          coverageLevel: "MODERATE",
          confidence: "MODERATE",
          methodologyVersion: "1.0.0",
        },
      });
    }
    scoreCount++;
  }
  console.log(`  ✓ ${scoreCount} occupation scores`);

  // ── Skill Links ──────────────────────────────────────────
  const skillLinks: Record<string, string[]> = {
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

  let linkCount = 0;
  for (const [occSlug, skillSlugs] of Object.entries(skillLinks)) {
    const occId = occupations[occSlug];
    if (!occId) continue;
    for (const skillSlug of skillSlugs) {
      const skillId = skills[skillSlug];
      if (!skillId) continue;
      await prisma.occupationSkillLink.upsert({
        where: { occupationId_skillId: { occupationId: occId, skillId } },
        update: {},
        create: { occupationId: occId, skillId, relevance: 80 },
      });
      linkCount++;
    }
  }
  console.log(`  ✓ ${linkCount} skill-occupation links`);

  // ── News Articles ────────────────────────────────────────
  const newsData = [
    { title: "AI Reshapes Software Development: GitHub Copilot Adoption Surges", sourceUrl: "https://arxiv.org/list/cs.AI/recent", publishedAt: new Date("2025-06-15"), summary: "Studies show AI coding assistants are being adopted by over 40% of developers, with measurable productivity gains but also concerns about code quality and junior developer skill development.", category: "Technology" },
    { title: "Healthcare Workers Face Limited AI Displacement, Study Finds", sourceUrl: "https://www.onetonline.org/", publishedAt: new Date("2025-05-20"), summary: "Research indicates patient-facing healthcare roles remain highly resistant to AI automation due to the need for empathy, physical presence, and complex decision-making.", category: "Healthcare" },
    { title: "Customer Service Roles See Accelerating AI Automation", sourceUrl: "https://www.mckinsey.com/mgi/overview", publishedAt: new Date("2025-07-01"), summary: "McKinsey reports that AI chatbots and automation tools are handling up to 60% of routine customer service interactions, reshaping the role of human agents.", category: "Operations" },
    { title: "Creative Industries Grapple with AI-Generated Content", sourceUrl: "https://www.weforum.org/", publishedAt: new Date("2025-04-10"), summary: "World Economic Forum analysis highlights the growing tension between AI-generated creative work and human creativity in design, writing, and media.", category: "Creative" },
    { title: "Financial Analysis Transformed by Machine Learning Models", sourceUrl: "https://arxiv.org/list/cs.AI/recent", publishedAt: new Date("2025-06-28"), summary: "New ML models are outperforming human analysts in certain financial forecasting tasks, though human judgment remains critical for complex strategic decisions.", category: "Finance" },
  ];

  let newsCount = 0;
  for (const n of newsData) {
    const source = sources[n.sourceUrl];
    if (!source) continue;
    await prisma.newsArticle.create({
      data: {
        title: n.title,
        sourceId: source,
        originalUrl: n.sourceUrl + "#" + n.title.toLowerCase().replace(/\s+/g, "-"),
        publishedAt: n.publishedAt,
        summary: n.summary,
        category: n.category,
        confidence: "MODERATE",
      },
    });
    newsCount++;
  }
  console.log(`  ✓ ${newsCount} news articles`);

  console.log("\n✅ Seed complete!");
  console.log("   Restart your dev server to see data on the homepage.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

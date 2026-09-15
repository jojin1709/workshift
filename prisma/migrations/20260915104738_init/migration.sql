-- CreateEnum
CREATE TYPE "CoverageLevel" AS ENUM ('HIGH', 'MODERATE', 'LIMITED', 'INSUFFICIENT');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OFFICIAL', 'GOVERNMENT', 'RESEARCH', 'ACADEMIC', 'INDUSTRY', 'NEWS', 'LABOR_MARKET', 'AI_PROVIDER', 'EDUCATION');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('HEALTHY', 'WARNING', 'FAILED', 'DISABLED', 'UNSUPPORTED');

-- CreateEnum
CREATE TYPE "EvidenceStrength" AS ENUM ('STRONG', 'MODERATE', 'WEAK', 'CONFLICTING');

-- CreateEnum
CREATE TYPE "PipelineRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'PARTIAL');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT,
    "coverageLevel" "CoverageLevel" NOT NULL DEFAULT 'INSUFFICIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occupationCode" TEXT,
    "taxonomy" TEXT,
    "industryId" TEXT,
    "globalAvailability" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationTask" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technicalAiCapability" INTEGER,
    "currentAdoption" INTEGER,
    "humanDependency" INTEGER,
    "automationExposure" INTEGER,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "confidence" "EvidenceStrength",
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OccupationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "aiExposure" INTEGER,
    "demandTrend" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCountry" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "SkillCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationSkillLink" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "relevance" INTEGER,

    CONSTRAINT "OccupationSkillLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,
    "language" TEXT,
    "officialUrl" TEXT NOT NULL,
    "priceVerified" BOOLEAN NOT NULL DEFAULT false,
    "price" TEXT,
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSkillLink" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CourseSkillLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCountry" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "CourseCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCapability" (
    "id" TEXT NOT NULL,
    "aiModelId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "AiCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT,
    "type" "SourceType" NOT NULL,
    "countryId" TEXT,
    "url" TEXT NOT NULL,
    "feedUrl" TEXT,
    "apiUrl" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'HEALTHY',
    "lastChecked" TIMESTAMP(3),
    "lastSuccess" TIMESTAMP(3),
    "lastFailure" TIMESTAMP(3),
    "credibilityLevel" INTEGER NOT NULL DEFAULT 3,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "PipelineRunStatus" NOT NULL DEFAULT 'RUNNING',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsRejected" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "SourceRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    "category" TEXT,
    "countryId" TEXT,
    "confidence" "EvidenceStrength",

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "publisher" TEXT,
    "journalOrRepo" TEXT,
    "publicationDate" TIMESTAMP(3),
    "doi" TEXT,
    "url" TEXT NOT NULL,
    "abstract" TEXT,
    "researchArea" TEXT,
    "sourceId" TEXT NOT NULL,
    "countryId" TEXT,

    CONSTRAINT "ResearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "occupationId" TEXT,
    "newsArticleId" TEXT,
    "researchItemId" TEXT,
    "extractedByAi" BOOLEAN NOT NULL DEFAULT false,
    "aiModelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "strength" "EvidenceStrength" NOT NULL DEFAULT 'MODERATE',
    "excerptSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationEvidence" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "OccupationEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "SkillEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationScore" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "aiExposureScore" INTEGER NOT NULL,
    "transformationLevel" TEXT NOT NULL,
    "confidence" "EvidenceStrength" NOT NULL,
    "evidenceCount" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OccupationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryOccupationScore" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "aiExposureScore" INTEGER,
    "coverageLevel" "CoverageLevel" NOT NULL DEFAULT 'INSUFFICIENT',
    "confidence" "EvidenceStrength",
    "methodologyVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountryOccupationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataQualityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataQualityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "PipelineRunStatus" NOT NULL DEFAULT 'RUNNING',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsRejected" INTEGER NOT NULL DEFAULT 0,
    "log" TEXT,

    CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "Country"("isoCode");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Occupation_slug_key" ON "Occupation"("slug");

-- CreateIndex
CREATE INDEX "Occupation_title_idx" ON "Occupation"("title");

-- CreateIndex
CREATE INDEX "Occupation_occupationCode_idx" ON "Occupation"("occupationCode");

-- CreateIndex
CREATE INDEX "OccupationTask_occupationId_idx" ON "OccupationTask"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_name_idx" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCountry_skillId_countryId_key" ON "SkillCountry"("skillId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationSkillLink_occupationId_skillId_key" ON "OccupationSkillLink"("occupationId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_title_idx" ON "Course"("title");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSkillLink_courseId_skillId_key" ON "CourseSkillLink"("courseId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCountry_courseId_countryId_key" ON "CourseCountry"("courseId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_name_key" ON "AiModel"("name");

-- CreateIndex
CREATE INDEX "Source_type_idx" ON "Source"("type");

-- CreateIndex
CREATE INDEX "Source_status_idx" ON "Source"("status");

-- CreateIndex
CREATE INDEX "SourceRun_sourceId_idx" ON "SourceRun"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_originalUrl_key" ON "NewsArticle"("originalUrl");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsArticle_countryId_idx" ON "NewsArticle"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchItem_doi_key" ON "ResearchItem"("doi");

-- CreateIndex
CREATE INDEX "ResearchItem_publicationDate_idx" ON "ResearchItem"("publicationDate");

-- CreateIndex
CREATE INDEX "Evidence_sourceId_idx" ON "Evidence"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationEvidence_occupationId_evidenceId_key" ON "OccupationEvidence"("occupationId", "evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEvidence_skillId_evidenceId_key" ON "SkillEvidence"("skillId", "evidenceId");

-- CreateIndex
CREATE INDEX "OccupationScore_occupationId_calculatedAt_idx" ON "OccupationScore"("occupationId", "calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CountryOccupationScore_occupationId_countryId_methodologyVe_key" ON "CountryOccupationScore"("occupationId", "countryId", "methodologyVersion");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occupation" ADD CONSTRAINT "Occupation_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationTask" ADD CONSTRAINT "OccupationTask_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCountry" ADD CONSTRAINT "SkillCountry_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCountry" ADD CONSTRAINT "SkillCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkillLink" ADD CONSTRAINT "OccupationSkillLink_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkillLink" ADD CONSTRAINT "OccupationSkillLink_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSkillLink" ADD CONSTRAINT "CourseSkillLink_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSkillLink" ADD CONSTRAINT "CourseSkillLink_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCountry" ADD CONSTRAINT "CourseCountry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCountry" ADD CONSTRAINT "CourseCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCapability" ADD CONSTRAINT "AiCapability_aiModelId_fkey" FOREIGN KEY ("aiModelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCapability" ADD CONSTRAINT "AiCapability_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceRun" ADD CONSTRAINT "SourceRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchItem" ADD CONSTRAINT "ResearchItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchItem" ADD CONSTRAINT "ResearchItem_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "NewsArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_researchItemId_fkey" FOREIGN KEY ("researchItemId") REFERENCES "ResearchItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationEvidence" ADD CONSTRAINT "OccupationEvidence_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationEvidence" ADD CONSTRAINT "OccupationEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationScore" ADD CONSTRAINT "OccupationScore_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryOccupationScore" ADD CONSTRAINT "CountryOccupationScore_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryOccupationScore" ADD CONSTRAINT "CountryOccupationScore_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

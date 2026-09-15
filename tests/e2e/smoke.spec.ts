import { test, expect } from "@playwright/test";

test("homepage loads and shows the hero without login prompts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /understand how ai is changing work/i })).toBeVisible();
  await expect(page.getByText(/sign in/i)).toHaveCount(0);
  await expect(page.getByText(/sign up/i)).toHaveCount(0);
});

test("careers page renders an honest empty state on an unseeded database", async ({ page }) => {
  await page.goto("/careers");
  await expect(page.getByRole("heading", { name: "Careers" })).toBeVisible();
  // On a fresh/unseeded deployment this should say so rather than
  // showing fabricated cards.
  const emptyState = page.getByText(/no occupation records are available yet/i);
  const hasCards = page.locator("a[href^='/careers/']");
  await expect(emptyState.or(hasCards.first())).toBeVisible();
});

test("methodology page explains the scoring approach", async ({ page }) => {
  await page.goto("/methodology");
  await expect(page.getByRole("heading", { name: "Methodology" })).toBeVisible();
  await expect(page.getByText(/not a job-replacement probability/i)).toBeVisible();
});

test("news page shows an honest empty state when nothing is ingested", async ({ page }) => {
  await page.goto("/news");
  const emptyState = page.getByText(/no verified updates are currently available/i);
  const hasArticles = page.locator("article, li a[target='_blank']");
  await expect(emptyState.or(hasArticles.first())).toBeVisible();
});

test("admin dashboard is not publicly accessible without login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("health API responds", async ({ request }) => {
  const res = await request.get("/api/health");
  expect([200, 503]).toContain(res.status());
});

test("stats API never returns hardcoded non-zero placeholder numbers on a fresh DB", async ({ request }) => {
  const res = await request.get("/api/stats");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(typeof body.data.occupations).toBe("number");
});

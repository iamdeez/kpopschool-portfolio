import { test, expect } from "@playwright/test";

// SC-001: one representative flow per domain works end to end on the real stack.
test("home page lists teachers, curriculums, and FAQ", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Learn K-Pop Dance/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Teachers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular Curriculums" })).toBeVisible();
});

test("teacher list navigates to a teacher's detail page", async ({ page }) => {
  await page.goto("/teachers");
  // Each card is a RouterLink with an aria-label (not visible "View profile"
  // text) — see Teachers.tsx TeacherCard.
  await page.getByRole("link", { name: /View .+'s profile/ }).first().click();
  await expect(page).toHaveURL(/\/teachers\/.+/);
});

test("curriculum list navigates to a curriculum's detail page", async ({ page }) => {
  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).first().click();
  await expect(page).toHaveURL(/\/curriculum\/.+/);
});

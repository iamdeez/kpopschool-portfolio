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
  // TeacherCard has no aria-label override (see Teachers.tsx — WCAG 2.5.3),
  // so its accessible name is its own visible text: "{name}" + "{category}
  // Trainer". Every card matches "Trainer", so this reliably finds one.
  await page.getByRole("link", { name: /Trainer/ }).first().click();
  await expect(page).toHaveURL(/\/teachers\/.+/);
});

test("curriculum list navigates to a curriculum's detail page", async ({ page }) => {
  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).first().click();
  await expect(page).toHaveURL(/\/curriculum\/.+/);
});

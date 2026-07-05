import { test, expect } from "@playwright/test";

// SC-004 (v1.2.0): a purchaser can post a lesson comment and see it appear immediately.
// Uses the 5th curriculum (nth(4)) — see lesson-progress.spec.ts for why each E2E
// spec needs its own curriculum index (the shared demo account's purchase
// history isn't cleared between runs).
test("demo visitor buys a course and posts a lesson comment", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(4).click();
  await page.getByRole("link", { name: "Buy this course" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL(/\/payment\/result/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(4).click();
  await page.getByRole("link", { name: "Watch lessons" }).click();
  await expect(page).toHaveURL(/\/curriculum\/.+\/lessons/);

  await expect(page.getByText("💬 Discussion")).toBeVisible();
  await page.getByPlaceholder("Ask a question or leave a comment…").fill("This lesson was really helpful!");
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.getByText("This lesson was really helpful!")).toBeVisible();
});

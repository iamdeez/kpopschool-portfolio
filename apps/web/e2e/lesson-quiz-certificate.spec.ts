import { test, expect } from "@playwright/test";

// SC-002/SC-004 (v1.2.0): passing a lesson quiz auto-completes it, and the
// certificate stays locked until every lesson (not just the quizzed one) is
// done. Uses the 4th curriculum (nth(3)) to avoid colliding with curriculums
// purchased by other E2E specs (see lesson-progress.spec.ts for the
// shared-demo-account rationale — reset-demo-data.ts doesn't clear
// customers/payments between runs).
test("demo visitor passes a lesson quiz, it auto-completes, and the certificate stays locked until 100%", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(3).click();
  await page.getByRole("link", { name: "Buy this course" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL(/\/payment\/result/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(3).click();
  await page.getByRole("link", { name: "Watch lessons" }).click();
  await expect(page).toHaveURL(/\/curriculum\/.+\/lessons/);

  // Lesson 1 has the seed-database.ts sample quiz (2 questions, 4 options each).
  await page.getByRole("button", { name: /^1\. /, exact: false }).click();
  await expect(page.getByText("📝 Quiz")).toBeVisible();

  // Chakra's Radio visually hides the native input under a custom control
  // span (same issue as Checkbox — see lesson-progress.spec.ts), so click
  // the visible option label text instead of the input directly. Correct
  // answers per seed-database.ts: "Your voice/body" (Q1), "A little, regularly" (Q2).
  await page.getByText("Your voice/body", { exact: true }).click();
  await page.getByText("A little, regularly", { exact: true }).click();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.getByText(/Passed! Lesson marked complete/)).toBeVisible();

  const url = page.url();
  const curriculumId = url.match(/\/curriculum\/([^/]+)\/lessons/)?.[1];
  await page.goto(`/curriculum/${curriculumId}/certificate`);
  await expect(page.getByText(/Not yet earned/)).toBeVisible();
});

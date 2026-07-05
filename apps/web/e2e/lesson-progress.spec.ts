import { test, expect } from "@playwright/test";

// SC-002/SC-003 (v1.1.0): a purchased course's lessons are watchable and
// completion updates progress immediately, both on the lesson page and MyPage.
//
// Uses the 3rd curriculum (nth(2)) rather than .first() — the shared demo
// account persists purchases across runs (reset-demo-data.ts intentionally
// doesn't clear customers/payments), and purchase-flow.spec.ts already buys
// the 1st curriculum; reusing that one here would hit the "already
// purchased" 409 guard on a second run.
test("demo visitor buys a course, completes a lesson, and sees progress reflected on MyPage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(2).click();
  await page.getByRole("link", { name: "Buy this course" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL(/\/payment\/result/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(2).click();
  await page.getByRole("link", { name: "Watch lessons" }).click();
  await expect(page).toHaveURL(/\/curriculum\/.+\/lessons/);

  // Lesson 1 has a v1.2.0 quiz (seed-database.ts) and shows quiz UI instead
  // of the plain checkbox — use lesson 2 to exercise the manual-complete path.
  await page.getByRole("button", { name: /^2\. /, exact: false }).click();
  // Chakra's Checkbox visually hides the native input and renders a custom
  // control span on top of it, which intercepts pointer events aimed at the
  // input directly — click the associated label text instead of .check().
  await page.getByText("Mark as complete").click();
  await expect(page.getByText(/^1\/\d+ lessons completed \(\d+%\)$/)).toBeVisible();

  await page.goto("/mypage");
  await page.getByRole("tab", { name: "My progress" }).click();
  await expect(page.getByText(/^1\/\d+ lessons completed \(\d+%\)$/)).toBeVisible();
});

// SC-002: a visitor who hasn't purchased the course sees a locked screen, not the video.
test("visitor without a purchase sees the lessons screen locked", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).nth(1).click();
  await page.getByRole("link", { name: "Watch lessons" }).click();
  await expect(page).toHaveURL(/\/curriculum\/.+\/lessons/);

  await expect(page.getByText(/haven't purchased this course yet/i)).toBeVisible();
});

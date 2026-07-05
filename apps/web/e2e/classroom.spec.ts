import { test, expect } from "@playwright/test";

// SC-005: reaches a classroom screen with no real Zoom account (INTEGRATION_MODE=demo).
test("demo visitor can join a mock classroom", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).first().click();
  await page.getByRole("link", { name: "Join a live class" }).click();

  await expect(page.getByText("Mock classroom")).toBeVisible();
  await expect(page.getByText(/Meeting number:/)).toBeVisible();
});

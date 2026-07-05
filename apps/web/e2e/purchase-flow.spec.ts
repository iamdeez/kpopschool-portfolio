import { test, expect } from "@playwright/test";

// SC-004: card -> buy -> history, no real charge (INTEGRATION_MODE=demo).
test("demo visitor can buy a curriculum and see it in payment history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);

  await page.goto("/curriculum");
  await page.getByRole("link", { name: "View details" }).first().click();
  await page.getByRole("link", { name: "Buy this course" }).click();

  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL(/\/payment\/result/);
  await expect(page.getByText(/Payment complete/i)).toBeVisible();

  await page.getByRole("link", { name: "View my purchases" }).click();
  await expect(page.getByText("My purchases")).toBeVisible();
});

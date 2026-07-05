import { test, expect } from "@playwright/test";

// SC-010: no real personal data typed in, still reaches MyPage.
test("visitor reaches MyPage via the demo login button without entering personal info", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/i }).click();
  await expect(page).toHaveURL(/\/mypage/);
  // Both tab labels are on screen simultaneously (Chakra Tabs), so assert on
  // one specific tab rather than an either/or text match.
  await expect(page.getByRole("tab", { name: "My purchases" })).toBeVisible();
});

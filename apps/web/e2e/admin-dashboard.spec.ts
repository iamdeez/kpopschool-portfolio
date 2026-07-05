import { test, expect } from "@playwright/test";

// SC-009: unauthenticated visitors are redirected away from admin routes.
test("unauthenticated visitor hitting /admin is redirected to admin login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

// SC-006: admin can run through create/list/delete for all four catalog domains.
// Requires an account promoted via `pnpm --filter server run create-admin <email>`.
test("admin can create, list, and delete a teacher", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByPlaceholder("Name").fill("E2E Test Teacher");
  await page.getByPlaceholder("Category").fill("Vocal");
  await page.getByRole("button", { name: "Add" }).first().click();
  await expect(page.getByText("E2E Test Teacher")).toBeVisible();

  // AdminTeachers.tsx renders name and Delete button as siblings in the same
  // HStack row — go to the sibling directly rather than an ancestor "div"
  // filter, which matches every nesting level (and therefore every row).
  await page
    .getByText("E2E Test Teacher")
    .locator("xpath=following-sibling::button[1]")
    .click();
  await expect(page.getByText("E2E Test Teacher")).not.toBeVisible();
});

// v1.2.0 SC-003: admin sees revenue/student/teacher/curriculum summary cards and a per-curriculum table.
test("admin sees the reports tab with summary cards and a curriculum table", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("button", { name: "Reports" }).click();
  await expect(page.getByText("Total revenue")).toBeVisible();
  await expect(page.getByText("Students")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Curriculum" })).toBeVisible();
});

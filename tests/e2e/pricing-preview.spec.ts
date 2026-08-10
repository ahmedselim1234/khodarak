import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 3 — quickstart.md steps 2-6. Requires a seeded
// admin test account (TEST_ADMIN_EMAIL/PASSWORD, same convention as
// tests/e2e/route-protection.spec.ts) and at least one available product
// and one active city already seeded (Phase 2/Phase 1). Skipped end-to-end
// when the admin account isn't configured — CI/local runs without live
// Supabase test accounts still get the rest of this repo's suite.
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test("/pricing-preview is reachable without signing in (FR-017a)", async ({ page }) => {
  const response = await page.goto("/pricing-preview");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveURL("/pricing-preview");
});

test("/subscription still requires sign-in — unaffected by the public preview route", async ({
  page,
}) => {
  await page.goto("/subscription");
  await expect(page).toHaveURL(/\/login/);
});

test.describe("admin changes a discount, the preview reflects it (US1 + US2 + US3, SC-003)", () => {
  test.skip(!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD, "TEST_ADMIN_EMAIL/PASSWORD not configured");

  test("changing the weekly discount in /admin/settings changes the price on /pricing-preview", async ({
    page,
  }) => {
    await page.goto("/pricing-preview");
    const firstQuantityInput = page.locator('input[type="number"]').first();
    const hasProduct = await firstQuantityInput.count();
    test.skip(hasProduct === 0, "no available products seeded to exercise the preview against");

    await firstQuantityInput.fill("2");
    await expect(page.getByText("تفاصيل السعر")).toBeVisible();
    const totalBefore = await page
      .getByText("الإجمالي لكل توصيلة")
      .locator("xpath=following-sibling::span")
      .textContent();

    await loginAs(page, TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    await page.goto("/admin/settings");
    const weeklyDiscountInput = page.getByLabel("نسبة الخصم (%)").first();
    await weeklyDiscountInput.fill("50");
    await page.getByRole("button", { name: "حفظ الإعدادات" }).click();
    await expect(page.getByText("تم حفظ الإعدادات بنجاح")).toBeVisible();

    await page.goto("/pricing-preview");
    await firstQuantityInput.fill("2");
    await expect(page.getByText("تفاصيل السعر")).toBeVisible();
    const totalAfter = await page
      .getByText("الإجمالي لكل توصيلة")
      .locator("xpath=following-sibling::span")
      .textContent();

    expect(totalAfter).not.toBe(totalBefore);
  });
});

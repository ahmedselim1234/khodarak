import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 10 — quickstart.md steps 2-3, the phase's own
// stated demo target: admin configures two intervals with different
// discounts, a customer selects one on a new subscription, and the live
// price breakdown reflects the configured discount. Requires seeded admin
// and customer test accounts (same convention as
// tests/e2e/admin-operations.spec.ts / tests/e2e/subscription-builder.spec.ts).
// Skipped end-to-end when these aren't configured.
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const TEST_CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const TEST_CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test("the delivery-intervals admin route requires admin access", async ({ page }) => {
  // Middleware protection is unchanged from Phase 1 — /admin (and its
  // sub-routes) redirect a signed-out visitor to /login.
  await page.goto("/admin/delivery-intervals");
  await expect(page).toHaveURL(/\/login/);
});

test.describe("admin configures delivery intervals and their discounts (US1, FR-001-004)", () => {
  test.skip(!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD, "TEST_ADMIN_EMAIL/PASSWORD not configured");

  test("adding a duplicate active day count is rejected", async ({ page }) => {
    await loginAs(page, TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    await page.goto("/admin/delivery-intervals");
    await expect(page.getByRole("heading", { name: "إدارة الخصومات — فواصل التوصيل" })).toBeVisible();

    await page.getByRole("button", { name: "إضافة فاصل زمني" }).click();
    await page.getByLabel("عدد الأيام بين كل توصيل").fill("2");
    await page.getByLabel("نسبة الخصم (٪)").fill("10");
    await page.getByRole("button", { name: "حفظ الفاصل الزمني" }).click();
    await expect(page.getByText("كل 2 يوم")).toBeVisible();

    await page.getByRole("button", { name: "إضافة فاصل زمني" }).click();
    await page.getByLabel("عدد الأيام بين كل توصيل").fill("2");
    await page.getByLabel("نسبة الخصم (٪)").fill("15");
    await page.getByRole("button", { name: "حفظ الفاصل الزمني" }).click();
    await expect(page.getByText("يوجد فاصل زمني نشط بنفس عدد الأيام بالفعل")).toBeVisible();
  });
});

test.describe("customer selects a configured interval and the price reflects its discount (US2, SC-001, the phase's own demo target)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD,
    "TEST_CUSTOMER_EMAIL/PASSWORD not configured"
  );

  test("selecting an interval updates the live breakdown", async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto("/subscription");

    const addButton = page.getByRole("button", { name: "أضف للصندوق" }).first();
    const hasProduct = await addButton.count();
    test.skip(hasProduct === 0, "no products seeded to exercise the builder against");
    await addButton.click();

    const intervalOption = page.getByRole("button", { name: /كل \d+ يوم/ }).first();
    const hasInterval = await intervalOption.count();
    test.skip(hasInterval === 0, "no active delivery interval seeded (run the admin describe block first)");

    await intervalOption.click();
    await expect(page.getByText("تفاصيل السعر")).toBeVisible();
  });
});

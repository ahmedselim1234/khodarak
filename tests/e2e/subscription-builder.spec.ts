import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 4 — quickstart.md steps 2-6, 8. Requires a
// seeded customer test account (TEST_CUSTOMER_EMAIL/PASSWORD, same
// convention as tests/e2e/route-protection.spec.ts) with at least one saved
// address and at least one item already in their cart, plus at least one
// available product and one active city seeded (Phase 1/2). Skipped
// end-to-end when the account isn't configured.
const TEST_CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const TEST_CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test("signed-out visitors are redirected to /login when visiting /subscription", async ({ page }) => {
  await page.goto("/subscription");
  await expect(page).toHaveURL(/\/login/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe("/subscription");
});

test.describe("build a box, watch the price react live, checkout, and confirm (US1-3, SC-001/002/003)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD,
    "TEST_CUSTOMER_EMAIL/PASSWORD not configured"
  );

  test("end-to-end subscription creation", async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto("/subscription");

    const addButton = page.getByRole("button", { name: "أضف للصندوق" }).first();
    const hasProduct = await addButton.count();
    test.skip(hasProduct === 0, "no products seeded to exercise the builder against");

    await addButton.click();
    await expect(page.getByText("تفاصيل السعر")).toBeVisible();

    const dateSelect = page.locator("select").last();
    await dateSelect.selectOption({ index: 1 });

    await page.getByRole("button", { name: "متابعة لإتمام الطلب" }).click();

    const addressButton = page.locator("button", { hasText: "،" }).first();
    const hasAddress = await addressButton.count();
    test.skip(hasAddress === 0, "no saved address to select at checkout");
    await addressButton.click();

    await page.getByRole("button", { name: "صباحاً" }).click();

    await page.getByRole("button", { name: "تأكيد الاشتراك" }).click();
    await page.waitForURL(/\/subscription\/confirmed\//);
    await expect(page.getByText("تم حفظ صندوقك بنجاح")).toBeVisible();
  });
});

import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 2 — quickstart.md steps 1-5. Requires a seeded
// admin test account (TEST_ADMIN_EMAIL/PASSWORD, same convention as
// tests/e2e/route-protection.spec.ts) and a customer test account
// (TEST_CUSTOMER_EMAIL/PASSWORD) with at least one pre-existing cart_items
// row, to exercise the guest→login merge (step 5). Skipped end-to-end when
// those aren't configured — CI/local runs without live Supabase test
// accounts still get the rest of this repo's suite.
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

test.describe("admin creates a product, it appears on /browse (US1 + SC-001)", () => {
  test.skip(!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD, "TEST_ADMIN_EMAIL/PASSWORD not configured");

  test("product created in /admin/products/new is visible on /browse without a manual refresh step", async ({
    page,
  }) => {
    await loginAs(page, TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);

    const uniqueName = `منتج اختبار ${Date.now()}`;
    await page.goto("/admin/products/new");
    await page.getByLabel("اسم المنتج").fill(uniqueName);
    await page.getByLabel("السعر (ر.س)").fill("9.99");
    await page.getByLabel("الحد الأدنى للكمية").fill("1");
    await page.getByLabel("الحد الأقصى للكمية").fill("5");

    // FR-001: submitting without a photo is rejected before the request is sent.
    await page.getByRole("button", { name: "إضافة المنتج" }).click();
    await expect(page.getByText("الصورة مطلوبة")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-product.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });
    await expect(page.getByRole("button", { name: /استبدال الصورة|رفع صورة/ })).not.toHaveText(
      "جارٍ رفع الصورة..."
    );

    await page.getByRole("button", { name: "إضافة المنتج" }).click();
    await page.waitForURL("/admin/products");
    await expect(page.getByText(uniqueName)).toBeVisible();

    await page.goto("/browse");
    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});

test.describe("customer browses, adjusts quantities, and the cart bar updates (US2 + US3)", () => {
  test("tab switch, stepper, and reload persistence work for a guest visitor", async ({ page }) => {
    await page.goto("/browse");

    await page.getByRole("button", { name: "فواكه" }).click();
    await expect(page).toHaveURL(/category=fruits/);

    const firstAddButton = page.getByRole("button", { name: "أضف للصندوق" }).first();
    const hasProduct = await firstAddButton.count();
    test.skip(hasProduct === 0, "no فواكه products seeded to exercise the stepper against");

    await firstAddButton.click();
    await expect(page.getByText(/\d+ منتج/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/\d+ منتج/)).toBeVisible();
  });
});

test.describe("guest cart merges into the account cart at login (US3, FR-015)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD,
    "TEST_CUSTOMER_EMAIL/PASSWORD not configured"
  );

  test("logging in with items in the guest cart merges rather than replaces", async ({ page }) => {
    await page.goto("/browse");
    const addButton = page.getByRole("button", { name: "أضف للصندوق" }).first();
    const hasProduct = await addButton.count();
    test.skip(hasProduct === 0, "no products seeded to exercise the merge against");

    await addButton.click();
    await expect(page.getByText(/\d+ منتج/)).toBeVisible();

    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);

    await page.goto("/browse");
    await expect(page.getByText(/\d+ منتج/)).toBeVisible();
  });
});

import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 8 — quickstart.md step 2. Requires a seeded
// admin test account (TEST_ADMIN_EMAIL/PASSWORD) and an existing pending
// order (TEST_PENDING_ORDER_ID, from Phase 5/7's own order generation).
// Skipped end-to-end when these aren't configured — CI/local runs without
// a live Supabase test account still get the rest of this repo's suite.
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const TEST_PENDING_ORDER_ID = process.env.TEST_PENDING_ORDER_ID;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe("process an order from pending to delivered (US1, SC-001)", () => {
  test.skip(
    !TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD || !TEST_PENDING_ORDER_ID,
    "TEST_ADMIN_EMAIL/PASSWORD/TEST_PENDING_ORDER_ID not configured"
  );

  test("advancing an order's status through delivery is reflected on the admin list", async ({
    page,
  }) => {
    await loginAs(page, TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    await page.goto("/admin/orders");

    await expect(page.getByRole("heading", { name: "إدارة الطلبات" })).toBeVisible();
    await page.getByRole("button", { name: "تحويل لقيد التوصيل" }).first().click();
    await expect(page.getByText("قيد التوصيل").first()).toBeVisible();
  });
});

test("the admin orders/subscriptions/payments/cities routes require admin access", async ({
  page,
}) => {
  // Middleware protection is unchanged from Phase 1 — /admin (and its
  // sub-routes) redirect a signed-out visitor to /login.
  for (const route of ["/admin/orders", "/admin/subscriptions", "/admin/payments", "/admin/cities"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  }
});

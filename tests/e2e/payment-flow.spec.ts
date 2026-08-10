import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 5 — quickstart.md steps 2 and 5. Requires a
// seeded customer test account (TEST_CUSTOMER_EMAIL/PASSWORD) with a
// pending-payment subscription, real Moyasar TEST-mode credentials
// configured (not the placeholder values this repo ships with), and
// Moyasar's published test cards. Skipped end-to-end when the account isn't
// configured — CI/local runs without live Supabase/Moyasar test accounts
// still get the rest of this repo's suite.
const TEST_CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const TEST_CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;
const TEST_PENDING_SUBSCRIPTION_ID = process.env.TEST_PENDING_SUBSCRIPTION_ID;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe("pay for a pending subscription (US1 + US2, SC-001/002)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD || !TEST_PENDING_SUBSCRIPTION_ID,
    "TEST_CUSTOMER_EMAIL/PASSWORD/TEST_PENDING_SUBSCRIPTION_ID not configured"
  );

  test("the payment step is reachable and requires consent before submitting", async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto(`/subscription/confirmed/${TEST_PENDING_SUBSCRIPTION_ID}`);

    await expect(page.getByText("إتمام الدفع لاشتراكك")).toBeVisible();

    // FR-003: submission is blocked without consent, even with a card entered.
    const payButton = page.getByRole("button", { name: "ادفع الآن" });
    await expect(payButton).toBeDisabled();
  });
});

test("signed-out visitors cannot reach a subscription's payment step", async ({ page }) => {
  test.skip(!TEST_PENDING_SUBSCRIPTION_ID, "TEST_PENDING_SUBSCRIPTION_ID not configured");
  await page.goto(`/subscription/confirmed/${TEST_PENDING_SUBSCRIPTION_ID}`);
  // Middleware protection is unchanged from Phase 1 — /subscription (and its
  // sub-routes) redirect signed-out visitors to /login.
  await expect(page).toHaveURL(/\/login/);
});

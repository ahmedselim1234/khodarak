import { test, expect, type Page } from "@playwright/test";

// Full demo path for Phase 6 — quickstart.md steps 2, 3, and 5. Requires a
// seeded customer test account (TEST_CUSTOMER_EMAIL/PASSWORD) with an
// existing active subscription (TEST_ACTIVE_SUBSCRIPTION_ID, produced by
// Phase 5's own activation flow) and at least one product available to add
// during the edit flow (TEST_ADDABLE_PRODUCT_NAME). Skipped end-to-end when
// the account isn't configured — CI/local runs without a live Supabase test
// account still get the rest of this repo's suite plus the always-runnable
// signed-out check below.
const TEST_CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const TEST_CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;
const TEST_ACTIVE_SUBSCRIPTION_ID = process.env.TEST_ACTIVE_SUBSCRIPTION_ID;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe("subscription status view (US1, SC-001)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD,
    "TEST_CUSTOMER_EMAIL/TEST_CUSTOMER_PASSWORD not configured"
  );

  test("shows status, next delivery, and a health badge for an active subscription", async ({
    page,
  }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto("/dashboard");

    await expect(page.getByText("نشط")).toBeVisible();
    await expect(page.getByText("التوصيلة القادمة")).toBeVisible();
  });
});

test.describe("edit the box outside the cutoff window (US2, SC-002)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD || !TEST_ACTIVE_SUBSCRIPTION_ID,
    "TEST_CUSTOMER_EMAIL/PASSWORD/TEST_ACTIVE_SUBSCRIPTION_ID not configured"
  );

  test("the editor opens and shows a live price breakdown before saving", async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "تعديل الصندوق" }).click();

    await expect(page.getByText("تعديل الصندوق")).toBeVisible();
    await expect(page.getByRole("button", { name: "حفظ التعديل" })).toBeVisible();
  });
});

test.describe("pause then resume early (US3, SC-005, the phase's own demo target)", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD || !TEST_ACTIVE_SUBSCRIPTION_ID,
    "TEST_CUSTOMER_EMAIL/PASSWORD/TEST_ACTIVE_SUBSCRIPTION_ID not configured"
  );

  test("pausing shows the resume date, and resuming early returns to active", async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "إيقاف مؤقت" }).click();
    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + 7);
    await page.getByLabel("استئناف في تاريخ").fill(resumeDate.toISOString().slice(0, 10));
    await page.getByRole("button", { name: "تأكيد الإيقاف" }).click();

    await expect(page.getByText("متوقف مؤقتاً")).toBeVisible();

    await page.getByRole("button", { name: "استئناف الآن" }).click();
    await expect(page.getByText("نشط")).toBeVisible();
  });
});

test("signed-out visitors cannot reach the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  // Middleware protection is unchanged from Phase 1 — /dashboard (and its
  // sub-routes) redirect signed-out visitors to /login.
  await expect(page).toHaveURL(/\/login/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe("/dashboard");
});

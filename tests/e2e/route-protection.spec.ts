import { test, expect, type Page } from "@playwright/test";

// Verifies the matrix in specs/002-phase-1-auth-address/contracts/route-protection.md.
// Customer/admin runs need seeded test accounts (see quickstart.md step 5 — an
// admin account is created by manually setting role='admin' on a profiles
// row, since there is no self-serve path to admin per FR-008). Those cases
// are skipped when the corresponding env vars aren't configured, so this
// suite still runs the signed-out matrix (which needs no test account) in
// every environment.
const protectedRoutes = ["/subscription", "/dashboard"];
const adminRoute = "/admin";

const TEST_CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const TEST_CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe("signed-out visitor", () => {
  for (const route of [...protectedRoutes, adminRoute]) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
      expect(new URL(page.url()).searchParams.get("redirect")).toBe(route);
    });
  }
});

test.describe("signed-in customer", () => {
  test.skip(
    !TEST_CUSTOMER_EMAIL || !TEST_CUSTOMER_PASSWORD,
    "TEST_CUSTOMER_EMAIL/TEST_CUSTOMER_PASSWORD not configured"
  );

  for (const route of protectedRoutes) {
    test(`${route} is reachable`, async ({ page }) => {
      await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
      await page.goto(route);
      await expect(page).toHaveURL(route);
    });
  }

  test(`${adminRoute} is denied and redirected away`, async ({ page }) => {
    await loginAs(page, TEST_CUSTOMER_EMAIL!, TEST_CUSTOMER_PASSWORD!);
    await page.goto(adminRoute);
    await expect(page).not.toHaveURL(adminRoute);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("signed-in admin", () => {
  test.skip(
    !TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD,
    "TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD not configured"
  );

  test(`${adminRoute} is reachable`, async ({ page }) => {
    await loginAs(page, TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    await page.goto(adminRoute);
    await expect(page).toHaveURL(adminRoute);
  });
});

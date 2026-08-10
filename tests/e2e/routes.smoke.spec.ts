import { test, expect } from "@playwright/test";

// Every route committed in specs/001-phase-0-foundation/spec.md FR-001.
// /browse/[id] uses a placeholder id, per the spec's Independent Test.
const routes = [
  "/",
  "/browse",
  "/browse/placeholder-id",
  "/subscription",
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/settings",
  "/admin",
  "/login",
];

for (const route of routes) {
  test(`${route} renders a styled RTL shell`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });
}

test("an uncommitted route shows a styled not-found page, not a broken response", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);

  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "العودة إلى الرئيسية" })).toBeVisible();
});

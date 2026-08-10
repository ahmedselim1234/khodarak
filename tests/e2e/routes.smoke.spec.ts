import { test, expect } from "@playwright/test";

// Every route committed in specs/001-phase-0-foundation/spec.md FR-001.
// /browse/[id] is now the real product detail page (Phase 2) and correctly
// 404s for a nonexistent id (FR-017) — see the dedicated assertion below
// instead of the generic ok() check every other route gets.
const routes = [
  "/",
  "/browse",
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

test("/browse/[id] with a nonexistent product id shows a styled not-found page (FR-017)", async ({
  page,
}) => {
  const response = await page.goto("/browse/00000000-0000-0000-0000-000000000000");
  expect(response?.status()).toBe(404);

  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
});

test("an uncommitted route shows a styled not-found page, not a broken response", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);

  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "العودة إلى الرئيسية" })).toBeVisible();
});

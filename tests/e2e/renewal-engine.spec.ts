import { test, expect } from "@playwright/test";

// Full demo path for Phase 7 — quickstart.md steps 2 and 5–6. Requires
// CRON_SECRET configured, a live linked Supabase project, and a seeded
// active subscription with a saved Moyasar test card
// (TEST_ACTIVE_SUBSCRIPTION_ID, back-dated to be due — see quickstart.md's
// setup steps). Skipped end-to-end when these aren't configured — CI/local
// runs without a live test account still get the rest of this repo's
// suite.
const CRON_SECRET = process.env.CRON_SECRET;
const TEST_ACTIVE_SUBSCRIPTION_ID = process.env.TEST_ACTIVE_SUBSCRIPTION_ID;
const TEST_DECLINING_SUBSCRIPTION_ID = process.env.TEST_DECLINING_SUBSCRIPTION_ID;

test.describe("a due subscription renews automatically (US1, SC-001/002)", () => {
  test.skip(
    !CRON_SECRET || !TEST_ACTIVE_SUBSCRIPTION_ID,
    "CRON_SECRET/TEST_ACTIVE_SUBSCRIPTION_ID not configured"
  );

  test("triggering the endpoint renews a back-dated active subscription", async ({ request }) => {
    const response = await request.post("/api/cron/renewals", {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.renewed).toBeGreaterThanOrEqual(1);
  });
});

test.describe("a declined charge is retried, then suspended (US2, SC-004)", () => {
  test.skip(
    !CRON_SECRET || !TEST_DECLINING_SUBSCRIPTION_ID,
    "CRON_SECRET/TEST_DECLINING_SUBSCRIPTION_ID not configured"
  );

  test("a declining test card results in a scheduled retry, not an immediate suspend", async ({
    request,
  }) => {
    const response = await request.post("/api/cron/renewals", {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.retryScheduled).toBeGreaterThanOrEqual(1);
  });
});

test("the endpoint rejects an unauthenticated caller", async ({ request }) => {
  const response = await request.post("/api/cron/renewals");
  expect(response.status()).toBe(401);
});

test("the endpoint rejects an incorrect secret", async ({ request }) => {
  const response = await request.post("/api/cron/renewals", {
    headers: { Authorization: "Bearer wrong-secret" },
  });
  expect(response.status()).toBe(401);
});

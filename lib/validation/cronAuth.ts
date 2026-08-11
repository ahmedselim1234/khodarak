import { timingSafeEqual } from "crypto";

// Constant-time comparison of the incoming Authorization header against the
// configured cron secret (FR-018) — a request that fails this check is
// rejected before anything else in the renewal endpoint runs. Pure (no
// env/server-only import), mirroring isValidWebhookSignature.ts, so it's
// directly unit-testable; the Route Handler passes serverEnv.CRON_SECRET in
// explicitly.
export function isValidCronAuth(
  headerValue: string | null | undefined,
  expectedSecret: string
): boolean {
  if (!headerValue || !headerValue.startsWith("Bearer ")) return false;

  const received = Buffer.from(headerValue.slice("Bearer ".length));
  const expected = Buffer.from(expectedSecret);

  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

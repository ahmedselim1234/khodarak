import { timingSafeEqual } from "crypto";

// Constant-time comparison of the incoming secret-token header against the
// configured webhook secret (research.md §4) — a request that fails this
// check is rejected before its body is parsed or trusted in any way. Pure
// (no env/server-only import) so it's directly unit-testable; the webhook
// Route Handler passes serverEnv.MOYASAR_WEBHOOK_SECRET in explicitly.
export function isValidWebhookSignature(
  headerValue: string | null | undefined,
  expectedSecret: string
): boolean {
  if (!headerValue) return false;

  const received = Buffer.from(headerValue);
  const expected = Buffer.from(expectedSecret);

  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

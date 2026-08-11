import "server-only";

type PaymentStatusRow = { status: "initiated" | "paid" | "failed" };

// research.md §4: counts consecutive 'failed' rows starting from the newest
// payment, stopping at the first 'paid' row (or the end of the list). Rows
// MUST already be ordered newest-first by the caller. A currently-'initiated'
// (in-flight) row is skipped rather than breaking the streak or counting as
// a failure — it hasn't resolved yet either way.
export function consecutiveFailedPayments(paymentsNewestFirst: PaymentStatusRow[]): number {
  let count = 0;

  for (const payment of paymentsNewestFirst) {
    if (payment.status === "paid") break;
    if (payment.status === "failed") count += 1;
  }

  return count;
}

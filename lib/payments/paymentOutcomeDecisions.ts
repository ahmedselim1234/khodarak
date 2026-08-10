// Pure decision helpers extracted from processPaymentOutcome.ts so they're
// directly unit-testable without a database (contracts/payment-outcome-processing.md's
// required-cases table). The actual concurrency guarantee comes from the
// conditional `UPDATE ... WHERE status NOT IN ('paid','failed')` SQL
// statement itself (research.md §3) — these helpers document and test the
// same semantics in isolation.

export type PaymentStatus = "initiated" | "paid" | "failed";

// Only an `'initiated'` payment should ever be resolved — a payment already
// in a terminal state has already been processed by an earlier call
// (the callback, an earlier webhook delivery, or a concurrent one).
export function shouldProcessOutcome(currentStatus: PaymentStatus): boolean {
  return currentStatus === "initiated";
}

// A newly saved payment method becomes the customer's default only when
// they have no other currently-active saved method.
export function shouldBeDefaultPaymentMethod(existingActivePaymentMethodCount: number): boolean {
  return existingActivePaymentMethodCount === 0;
}

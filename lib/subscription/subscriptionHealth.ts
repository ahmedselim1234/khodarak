export type SubscriptionHealthInput = {
  status: "pending_payment" | "active" | "paused" | "cancelled";
  consecutiveFailedPayments: number;
  hasPendingChangeInsideCutoff: boolean;
};

export type SubscriptionHealth = "good" | "needs_attention";

// research.md §4 / spec.md Clarification 1: a plain, deterministic state —
// no numeric score, no new signal beyond what already exists elsewhere in
// the system. A cancelled subscription is always 'good' since nothing about
// it is actionable anymore (a stale failure count from before cancellation
// has nothing left to warn the customer about).
export function subscriptionHealth(input: SubscriptionHealthInput): SubscriptionHealth {
  if (input.status === "cancelled") {
    return "good";
  }

  if (input.consecutiveFailedPayments > 0) {
    return "needs_attention";
  }

  if (input.hasPendingChangeInsideCutoff) {
    return "needs_attention";
  }

  return "good";
}

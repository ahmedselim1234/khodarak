export type DunningDecision = { action: "retry"; retryAt: Date } | { action: "suspend" };

// research.md §4 / spec.md Clarification 5: a fixed, non-configurable
// schedule — retry at +1, +3, +5 days after the cycle's ORIGINAL failure
// (never compounding from the previous retry), then suspend. attemptCount
// is how many attempts have now failed for this still-open cycle: 1 after
// the first (non-retry) attempt fails, 2 after the first retry fails, 3
// after the second retry fails; a 4th failure (the third retry) suspends.
const RETRY_OFFSETS_DAYS = [1, 3, 5];
const DAY_MS = 24 * 60 * 60 * 1000;

export function nextRetryOrSuspend(attemptCount: number, firstFailedAt: Date): DunningDecision {
  const offsetIndex = attemptCount - 1;

  if (offsetIndex >= RETRY_OFFSETS_DAYS.length) {
    return { action: "suspend" };
  }

  const retryAt = new Date(firstFailedAt.getTime() + RETRY_OFFSETS_DAYS[offsetIndex] * DAY_MS);
  return { action: "retry", retryAt };
}

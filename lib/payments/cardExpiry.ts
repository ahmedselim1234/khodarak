// FR-006: checked against the specific delivery/renewal date being charged
// for, not merely "today" — a card that's still valid now but would have
// expired by a delayed retry's date is still caught before that retry fires
// (spec.md's own Assumptions). Card networks treat a card as valid through
// the last day of its expiry month, so "expired" means the target date is
// in a later month than (expYear, expMonth), not merely a later day.
export function isCardExpiredByDate(
  card: { expMonth: number; expYear: number },
  targetDate: string // ISO date (YYYY-MM-DD)
): boolean {
  const [targetYear, targetMonth] = targetDate.split("-").map(Number);

  if (targetYear > card.expYear) return true;
  if (targetYear < card.expYear) return false;
  return targetMonth > card.expMonth;
}

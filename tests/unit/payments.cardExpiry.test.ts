import { describe, expect, it } from "vitest";
import { isCardExpiredByDate } from "@/lib/payments/cardExpiry";

describe("isCardExpiredByDate", () => {
  it("treats a card already expired as of the delivery date as expired", () => {
    // Card expires end of July 2026; delivery is in August 2026.
    expect(isCardExpiredByDate({ expMonth: 7, expYear: 2026 }, "2026-08-11")).toBe(true);
  });

  it("treats a card expiring in the same month as the delivery as still valid", () => {
    // Moyasar/card-network convention: a card is valid through the end of
    // its expiry month.
    expect(isCardExpiredByDate({ expMonth: 8, expYear: 2026 }, "2026-08-11")).toBe(false);
  });

  it("treats a card expiring after the delivery date as valid", () => {
    expect(isCardExpiredByDate({ expMonth: 12, expYear: 2026 }, "2026-08-11")).toBe(false);
  });

  it("catches a card that expires between now and a delayed retry's date", () => {
    // A retry delayed to a date past the card's expiry month is caught,
    // even though the card was still valid when the cycle first failed.
    expect(isCardExpiredByDate({ expMonth: 8, expYear: 2026 }, "2026-09-01")).toBe(true);
  });

  it("handles a year boundary correctly", () => {
    expect(isCardExpiredByDate({ expMonth: 12, expYear: 2025 }, "2026-01-05")).toBe(true);
    expect(isCardExpiredByDate({ expMonth: 1, expYear: 2026 }, "2026-01-05")).toBe(false);
  });
});

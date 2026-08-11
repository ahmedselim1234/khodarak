import { describe, expect, it } from "vitest";
import { advanceDeliveryDate } from "@/lib/subscription/advanceDeliveryDate";

describe("advanceDeliveryDate", () => {
  it("advances a weekly subscription by exactly 7 days", () => {
    expect(advanceDeliveryDate("2026-08-11", "weekly", [])).toBe("2026-08-18");
  });

  it("advances a biweekly subscription by exactly 14 days", () => {
    expect(advanceDeliveryDate("2026-08-11", "biweekly", [])).toBe("2026-08-25");
  });

  it("advances a monthly subscription by one calendar month, same day-of-month", () => {
    expect(advanceDeliveryDate("2026-08-11", "monthly", [])).toBe("2026-09-11");
  });

  it("handles a monthly advance across a shorter month (end-of-month clamping)", () => {
    // Jan 31 + 1 month has no Feb 31 — JS Date rolls over to Mar 3 (2027 is
    // not a leap year); this test documents that behavior explicitly.
    expect(advanceDeliveryDate("2027-01-31", "monthly", [])).toBe("2027-03-03");
  });

  it("skips forward past a blackout weekday to the next valid day", () => {
    // 2026-08-11 is a Tuesday; +7 days = 2026-08-18, also a Tuesday.
    // Blacking out Tuesday(2) should push the result to 2026-08-19.
    expect(advanceDeliveryDate("2026-08-11", "weekly", [2])).toBe("2026-08-19");
  });

  it("skips forward past multiple consecutive blackout weekdays", () => {
    // 2026-08-18 is a Tuesday. Blackout Tue(2) and Wed(3) should push to
    // Thursday 2026-08-20.
    expect(advanceDeliveryDate("2026-08-11", "weekly", [2, 3])).toBe("2026-08-20");
  });

  it("does not shift a result that already lands on a non-blackout day", () => {
    expect(advanceDeliveryDate("2026-08-11", "weekly", [5])).toBe("2026-08-18");
  });
});

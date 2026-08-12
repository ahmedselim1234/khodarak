import { describe, expect, it } from "vitest";
import { advanceDeliveryDateByInterval } from "@/lib/subscription/advanceDeliveryDate";

describe("advanceDeliveryDateByInterval", () => {
  it("advances by exactly 2 days for a 2-day interval", () => {
    expect(advanceDeliveryDateByInterval("2026-08-11", 2, [])).toBe("2026-08-13");
  });

  it("advances by exactly 90 days for a 90-day interval", () => {
    expect(advanceDeliveryDateByInterval("2026-08-11", 90, [])).toBe("2026-11-09");
  });

  it("skips forward past a blackout weekday to the next valid day", () => {
    // 2026-08-11 is a Tuesday; +2 days = 2026-08-13, a Thursday.
    // Blacking out Thursday(4) should push the result to 2026-08-14.
    expect(advanceDeliveryDateByInterval("2026-08-11", 2, [4])).toBe("2026-08-14");
  });

  it("does not shift a result that already lands on a non-blackout day", () => {
    expect(advanceDeliveryDateByInterval("2026-08-11", 2, [5])).toBe("2026-08-13");
  });
});

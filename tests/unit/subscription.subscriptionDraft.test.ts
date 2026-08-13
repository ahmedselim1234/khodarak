import { describe, expect, it } from "vitest";
import { sanitizeSubscriptionDraft } from "@/lib/subscription/subscriptionDraft";

// Wednesday, 2026-08-12 — same fixed reference "today" the delivery-date
// tests use, so these don't depend on the actual calendar date.
const TODAY = new Date("2026-08-12T00:00:00Z");
const RULES = { leadDays: 2, blackoutWeekdays: [] as number[] };

const VALID_DATE = "2026-08-20";

function draft(overrides: Record<string, unknown> = {}) {
  return {
    step: "checkout",
    category: "fruits",
    deliveryIntervalId: "interval-1",
    cityId: "city-1",
    deliveryDate: VALID_DATE,
    addressId: "address-1",
    timeSlot: "morning",
    ...overrides,
  };
}

describe("sanitizeSubscriptionDraft", () => {
  it("round-trips a fully valid draft", () => {
    expect(sanitizeSubscriptionDraft(draft(), TODAY, RULES)).toEqual({
      step: "checkout",
      category: "fruits",
      deliveryIntervalId: "interval-1",
      cityId: "city-1",
      deliveryDate: VALID_DATE,
      addressId: "address-1",
      timeSlot: "morning",
    });
  });

  it("rejects non-object payloads", () => {
    expect(sanitizeSubscriptionDraft(null, TODAY, RULES)).toBeNull();
    expect(sanitizeSubscriptionDraft("draft", TODAY, RULES)).toBeNull();
    expect(sanitizeSubscriptionDraft([], TODAY, RULES)).toBeNull();
  });

  it("drops a delivery date that has fallen inside the lead-time window", () => {
    // The draft was written days ago; today the date is already too soon.
    const stale = sanitizeSubscriptionDraft(
      draft({ deliveryDate: "2026-08-13" }),
      TODAY,
      RULES
    );
    expect(stale?.deliveryDate).toBeNull();
  });

  it("drops a delivery date that now falls on a blackout weekday", () => {
    // 2026-08-20 is a Thursday (getUTCDay() === 4).
    const blacked = sanitizeSubscriptionDraft(draft(), TODAY, {
      leadDays: 2,
      blackoutWeekdays: [4],
    });
    expect(blacked?.deliveryDate).toBeNull();
  });

  it("drops an unrecognized time slot", () => {
    expect(sanitizeSubscriptionDraft(draft({ timeSlot: "midnight" }), TODAY, RULES)?.timeSlot)
      .toBeNull();
  });

  it("falls back to safe defaults for unrecognized step and category", () => {
    const result = sanitizeSubscriptionDraft(
      draft({ step: "confirm", category: "meat" }),
      TODAY,
      RULES
    );
    expect(result?.step).toBe("build");
    expect(result?.category).toBe("vegetables");
  });

  it("nulls out ids that are missing, empty, or the wrong type", () => {
    const result = sanitizeSubscriptionDraft(
      draft({ deliveryIntervalId: "", cityId: 42, addressId: undefined }),
      TODAY,
      RULES
    );
    expect(result?.deliveryIntervalId).toBeNull();
    expect(result?.cityId).toBeNull();
    expect(result?.addressId).toBeNull();
  });
});

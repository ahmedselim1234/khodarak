import { describe, expect, it } from "vitest";
import {
  estimateDeliveriesPerMonth,
  formatDeliveryCadenceLabel,
} from "@/lib/pricing/deliveryInterval";

describe("estimateDeliveriesPerMonth", () => {
  it("computes ≈30÷days, rounded to 2 decimals", () => {
    expect(estimateDeliveriesPerMonth(2)).toBe(15);
    expect(estimateDeliveriesPerMonth(3)).toBeCloseTo(10, 2);
    expect(estimateDeliveriesPerMonth(7)).toBeCloseTo(4.29, 2);
  });
});

describe("formatDeliveryCadenceLabel", () => {
  it("labels a legacy named frequency", () => {
    expect(formatDeliveryCadenceLabel("weekly", null)).toBe("أسبوعي");
    expect(formatDeliveryCadenceLabel("biweekly", null)).toBe("كل أسبوعين");
    expect(formatDeliveryCadenceLabel("monthly", null)).toBe("شهري");
  });

  it("labels a custom_interval subscription by its day count, not the raw enum value", () => {
    // Phase 11 regression test — the admin subscriptions list/detail views
    // (SubscriptionTable.tsx, SubscriptionDetailView.tsx) previously showed
    // the literal string "custom_interval" for a Phase 10 delivery-interval
    // subscription instead of a human-readable label (research.md/tasks.md
    // T015 bug fix).
    expect(formatDeliveryCadenceLabel("custom_interval", { days: 2 })).toBe("كل 2 يوم");
    expect(formatDeliveryCadenceLabel("custom_interval", { days: 90 })).toBe("كل 90 يوم");
  });

  it("falls back to the raw value for an unrecognized frequency", () => {
    expect(formatDeliveryCadenceLabel("unknown", null)).toBe("unknown");
  });
});

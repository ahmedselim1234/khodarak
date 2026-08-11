import { describe, expect, it } from "vitest";
import { resolveEffectiveConfig } from "@/lib/subscription/resolveEffectiveConfig";

const CURRENT = {
  frequency: "weekly" as const,
  addressId: "addr-current",
  items: [{ productId: "p1", quantity: 2 }],
  priceBreakdown: { totalPerDelivery: 20 } as unknown,
};

const PENDING = {
  frequency: "biweekly" as const,
  addressId: "addr-pending",
  items: [{ productId: "p1", quantity: 3 }],
  priceBreakdown: { totalPerDelivery: 30 } as unknown,
  effectiveFrom: "2026-08-25",
};

describe("resolveEffectiveConfig", () => {
  it("returns current for both locked and pending-change=null when no pending change exists", () => {
    const result = resolveEffectiveConfig({
      now: new Date("2026-08-11T00:00:00Z"),
      nextDeliveryDate: "2026-08-18",
      current: CURRENT,
      pending: null,
    });

    expect(result.locked).toEqual(CURRENT);
    expect(result.pendingChange).toBeNull();
  });

  it("keeps the locked delivery on current fields when now is before next_delivery_date", () => {
    const result = resolveEffectiveConfig({
      now: new Date("2026-08-11T00:00:00Z"),
      nextDeliveryDate: "2026-08-18",
      current: CURRENT,
      pending: PENDING,
    });

    expect(result.locked).toEqual(CURRENT);
    expect(result.pendingChange).toEqual(PENDING);
  });

  it("resolves both locked and pendingChange to the pending values once now is at/after next_delivery_date", () => {
    const result = resolveEffectiveConfig({
      now: new Date("2026-08-19T00:00:00Z"),
      nextDeliveryDate: "2026-08-18",
      current: CURRENT,
      pending: PENDING,
    });

    expect(result.locked).toEqual({
      frequency: PENDING.frequency,
      addressId: PENDING.addressId,
      items: PENDING.items,
      priceBreakdown: PENDING.priceBreakdown,
    });
    expect(result.pendingChange).toBeNull();
  });

  it("treats 'now' exactly equal to next_delivery_date as already passed", () => {
    const result = resolveEffectiveConfig({
      now: new Date("2026-08-18T00:00:00Z"),
      nextDeliveryDate: "2026-08-18",
      current: CURRENT,
      pending: PENDING,
    });

    expect(result.locked.frequency).toBe("biweekly");
    expect(result.pendingChange).toBeNull();
  });
});

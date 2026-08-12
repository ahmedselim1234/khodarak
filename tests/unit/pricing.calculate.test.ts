import { describe, expect, it } from "vitest";
import { calculate } from "@/lib/pricing/calculate";
import type { Frequencies } from "@/lib/pricing/mapSettingsRow";

const baseFrequencies: Frequencies = {
  weekly: { enabled: true, discountPercent: 10, deliveriesPerMonth: 4 },
  biweekly: { enabled: true, discountPercent: 8, deliveriesPerMonth: 2 },
  monthly: { enabled: false, discountPercent: 12, deliveriesPerMonth: 1 },
};

const baseSettings = {
  frequencies: baseFrequencies,
  minOrderValue: 50,
  maxItemsPerBox: 10,
  editCutoffHours: 24,
  firstDeliveryLeadDays: 2,
  blackoutWeekdays: [] as number[],
  deliveryMode: "flat" as const,
  deliveryFlatFee: 10,
  deliveryFreeThreshold: 150,
  maxPauseDays: 30,
  maxPausesPerYear: 4,
  vatPercent: 15,
  pricesIncludeVat: true,
  roundingMode: "nearest_0.5" as const,
  updatedAt: "2026-08-10T00:00:00Z",
};

const cityNoOverride = { id: "city-1", deliveryFeeOverride: null };
const cityWithOverride = { id: "city-2", deliveryFeeOverride: 5 };

describe("calculate — happy path", () => {
  it("matches the documented formula by hand for a basic multi-item order", () => {
    const result = calculate({
      items: [
        { productId: "p1", price: 20, quantity: 2 }, // 40
        { productId: "p2", price: 15, quantity: 1 }, // 15
      ],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    // itemsSubtotal = 40 + 15 = 55
    expect(result.itemsSubtotal).toBe(55);
    // frequencyDiscountAmount = 55 * 10% = 5.5
    expect(result.frequencyDiscountAmount).toBe(5.5);
    // afterDiscount = 55 - 5.5 = 49.5
    expect(result.afterDiscount).toBe(49.5);
    // deliveryFee = flat fee = 10 (afterDiscount below free threshold anyway, mode is 'flat')
    expect(result.deliveryFee).toBe(10);
    // taxableBase = 49.5 + 10 = 59.5
    expect(result.taxableBase).toBe(59.5);
    expect(result.droppedItems).toEqual([]);
  });

  it("computes estimatedMonthly using the selected frequency's deliveriesPerMonth", () => {
    const weekly = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });
    const biweekly = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "biweekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(weekly.estimatedMonthly).toBeCloseTo(weekly.totalPerDelivery * 4, 5);
    expect(biweekly.estimatedMonthly).toBeCloseTo(biweekly.totalPerDelivery * 2, 5);
  });
});

describe("calculate — order rule flags (FR-016)", () => {
  it("flags meetsMinimumOrderValue: false without blocking the calculation", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 10, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.itemsSubtotal).toBe(10);
    expect(result.meetsMinimumOrderValue).toBe(false);
    expect(result.totalPerDelivery).toBeGreaterThan(0);
  });

  it("flags withinMaxItemsPerBox: false when total quantity exceeds the max", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 10, quantity: 11 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.withinMaxItemsPerBox).toBe(false);
  });

  it("flags both true when the order satisfies both rules", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 60, quantity: 2 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.meetsMinimumOrderValue).toBe(true);
    expect(result.withinMaxItemsPerBox).toBe(true);
  });
});

describe("calculate — delivery fee resolution", () => {
  const zeroDiscountFrequencies: Frequencies = {
    weekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 4 },
    biweekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 2 },
    monthly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 1 },
  };

  it("charges nothing once afterDiscount exactly meets the free-delivery threshold (inclusive boundary)", () => {
    const settings = {
      ...baseSettings,
      frequencies: zeroDiscountFrequencies,
      deliveryMode: "free_above_threshold" as const,
      deliveryFreeThreshold: 150,
    };
    const result = calculate({
      items: [{ productId: "p1", price: 150, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings,
    });

    expect(result.afterDiscount).toBe(150);
    expect(result.deliveryFee).toBe(0);
  });

  it("charges the flat fee when afterDiscount is one cent below the free-delivery threshold", () => {
    const settings = {
      ...baseSettings,
      frequencies: zeroDiscountFrequencies,
      deliveryMode: "free_above_threshold" as const,
      deliveryFreeThreshold: 150,
      deliveryFlatFee: 10,
    };
    const result = calculate({
      items: [{ productId: "p1", price: 149.99, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings,
    });

    expect(result.afterDiscount).toBe(149.99);
    expect(result.deliveryFee).toBe(10);
  });

  it("uses the city's delivery fee override in per_city mode", () => {
    const settings = {
      ...baseSettings,
      frequencies: zeroDiscountFrequencies,
      deliveryMode: "per_city" as const,
      deliveryFlatFee: 10,
    };
    const result = calculate({
      items: [{ productId: "p1", price: 20, quantity: 1 }],
      frequency: "weekly",
      city: cityWithOverride,
      settings,
    });

    expect(result.deliveryFee).toBe(5);
  });

  it("falls back to the flat fee in per_city mode when the city has no override", () => {
    const settings = {
      ...baseSettings,
      frequencies: zeroDiscountFrequencies,
      deliveryMode: "per_city" as const,
      deliveryFlatFee: 10,
    };
    const result = calculate({
      items: [{ productId: "p1", price: 20, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings,
    });

    expect(result.deliveryFee).toBe(10);
  });
});

describe("calculate — VAT inclusive vs. exclusive", () => {
  const zeroDiscountFrequencies: Frequencies = {
    weekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 4 },
    biweekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 2 },
    monthly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 1 },
  };
  const settingsBase = {
    ...baseSettings,
    frequencies: zeroDiscountFrequencies,
    deliveryMode: "flat" as const,
    deliveryFlatFee: 0,
    vatPercent: 15,
    roundingMode: "none" as const,
  };

  it("extracts VAT from the taxable base when prices already include it", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 115, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...settingsBase, pricesIncludeVat: true },
    });

    // taxableBase = 115; VAT extracted = 115 - 115/1.15 = 15
    expect(result.taxableBase).toBe(115);
    expect(result.vatAmount).toBeCloseTo(15, 2);
    expect(result.totalPerDelivery).toBeCloseTo(115, 2);
  });

  it("adds VAT on top when prices do not include it", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...settingsBase, pricesIncludeVat: false },
    });

    // taxableBase = 100; VAT added = 100 * 15% = 15
    expect(result.taxableBase).toBe(100);
    expect(result.vatAmount).toBeCloseTo(15, 2);
    expect(result.totalPerDelivery).toBeCloseTo(115, 2);
  });

  it("produces materially different totals for the same inputs depending on the VAT setting", () => {
    const inclusive = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...settingsBase, pricesIncludeVat: true },
    });
    const exclusive = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...settingsBase, pricesIncludeVat: false },
    });

    expect(inclusive.totalPerDelivery).not.toBeCloseTo(exclusive.totalPerDelivery, 2);
  });
});

describe("calculate — rounding modes", () => {
  const zeroDiscountFrequencies: Frequencies = {
    weekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 4 },
    biweekly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 2 },
    monthly: { enabled: true, discountPercent: 0, deliveriesPerMonth: 1 },
  };
  // vatPercent: 0, deliveryFlatFee: 0 isolates the pre-rounding total to
  // exactly the single item's price, so the rounding boundary lands exactly
  // where the test expects it to.
  const roundingSettingsBase = {
    ...baseSettings,
    frequencies: zeroDiscountFrequencies,
    deliveryMode: "flat" as const,
    deliveryFlatFee: 0,
    vatPercent: 0,
    pricesIncludeVat: false,
  };

  it("rounds a boundary value to the nearest 0.5", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 12.25, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...roundingSettingsBase, roundingMode: "nearest_0.5" },
    });

    expect(result.totalPerDelivery).toBe(12.5);
  });

  it("rounds a boundary value to the nearest 1", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 12.5, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...roundingSettingsBase, roundingMode: "nearest_1" },
    });

    expect(result.totalPerDelivery).toBe(13);
  });

  it("leaves the value unchanged (to 2 decimals) when rounding mode is 'none'", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 12.257, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: { ...roundingSettingsBase, roundingMode: "none" },
    });

    expect(result.totalPerDelivery).toBeCloseTo(12.26, 2);
  });
});

describe("calculate — custom_interval (Phase 10)", () => {
  it("sources the discount from deliveryInterval instead of settings.frequencies", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 40, quantity: 1 }],
      frequency: "custom_interval",
      deliveryInterval: { discountPercent: 10, deliveriesPerMonth: 15 },
      city: cityNoOverride,
      settings: baseSettings,
    });

    // frequencyDiscountAmount = 40 * 10% = 4
    expect(result.frequencyDiscountAmount).toBe(4);
    expect(result.afterDiscount).toBe(36);
  });

  it("supports a 0% interval discount as a valid explicit value, not a fallback", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 40, quantity: 1 }],
      frequency: "custom_interval",
      deliveryInterval: { discountPercent: 0, deliveriesPerMonth: 30 },
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.frequencyDiscountAmount).toBe(0);
    expect(result.afterDiscount).toBe(40);
  });

  it("computes estimatedMonthly from deliveryInterval.deliveriesPerMonth for a 90-day interval", () => {
    const result = calculate({
      items: [{ productId: "p1", price: 100, quantity: 1 }],
      frequency: "custom_interval",
      deliveryInterval: { discountPercent: 5, deliveriesPerMonth: 0.33 },
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.estimatedMonthly).toBeCloseTo(result.totalPerDelivery * 0.33, 5);
  });

  it("leaves the legacy frequency path completely unaffected by the presence of custom_interval", () => {
    const legacy = calculate({
      items: [{ productId: "p1", price: 40, quantity: 1 }],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(legacy.frequencyDiscountAmount).toBe(4); // 40 * 10% (weekly's own discount)
  });
});

describe("calculate — edge cases", () => {
  it("handles an empty item list without NaN or division-by-zero", () => {
    const result = calculate({
      items: [],
      frequency: "weekly",
      city: cityNoOverride,
      settings: baseSettings,
    });

    expect(result.itemsSubtotal).toBe(0);
    expect(result.frequencyDiscountAmount).toBe(0);
    expect(result.totalPerDelivery).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(result.totalPerDelivery)).toBe(false);
    expect(result.meetsMinimumOrderValue).toBe(false);
    expect(result.withinMaxItemsPerBox).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { settingsUpdateSchema } from "@/lib/validation/settings";

describe("settingsUpdateSchema", () => {
  it("accepts a partial update with a single field", () => {
    expect(settingsUpdateSchema.safeParse({ minOrderValue: 60 }).success).toBe(true);
  });

  it("rejects an empty payload", () => {
    expect(settingsUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a negative discount percentage", () => {
    expect(
      settingsUpdateSchema.safeParse({
        frequencies: { weekly: { enabled: true, discountPercent: -5, deliveriesPerMonth: 4 } },
      }).success
    ).toBe(false);
  });

  it("rejects a discount percentage over 100", () => {
    expect(
      settingsUpdateSchema.safeParse({
        frequencies: { weekly: { enabled: true, discountPercent: 150, deliveriesPerMonth: 4 } },
      }).success
    ).toBe(false);
  });

  it("rejects a VAT percentage over 100", () => {
    expect(settingsUpdateSchema.safeParse({ vatPercent: 120 }).success).toBe(false);
  });

  it("rejects a negative currency amount", () => {
    expect(settingsUpdateSchema.safeParse({ deliveryFlatFee: -1 }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ minOrderValue: -10 }).success).toBe(false);
  });

  it("rejects an invalid deliveryMode enum value", () => {
    expect(settingsUpdateSchema.safeParse({ deliveryMode: "teleport" }).success).toBe(false);
  });

  it("rejects an invalid roundingMode enum value", () => {
    expect(settingsUpdateSchema.safeParse({ roundingMode: "nearest_100" }).success).toBe(false);
  });

  it("rejects a blackoutWeekdays entry outside 0-6", () => {
    expect(settingsUpdateSchema.safeParse({ blackoutWeekdays: [7] }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ blackoutWeekdays: [-1] }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ blackoutWeekdays: [0, 5, 6] }).success).toBe(true);
  });

  it("accepts a valid full frequencies update", () => {
    expect(
      settingsUpdateSchema.safeParse({
        frequencies: {
          weekly: { enabled: true, discountPercent: 15, deliveriesPerMonth: 4 },
        },
      }).success
    ).toBe(true);
  });
});

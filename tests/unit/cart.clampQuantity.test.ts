import { describe, expect, it } from "vitest";
import { clampQuantity } from "@/lib/cart/clampQuantity";

const bounds = { minQty: 2, maxQty: 8 };

describe("clampQuantity", () => {
  it("returns the value unchanged when within bounds", () => {
    expect(clampQuantity(5, bounds)).toBe(5);
  });

  it("clamps at the minimum bound", () => {
    expect(clampQuantity(2, bounds)).toBe(2);
  });

  it("clamps a value below the minimum up to the minimum", () => {
    expect(clampQuantity(1, bounds)).toBe(2);
  });

  it("clamps at the maximum bound", () => {
    expect(clampQuantity(8, bounds)).toBe(8);
  });

  it("clamps a value above the maximum down to the maximum", () => {
    expect(clampQuantity(9, bounds)).toBe(8);
  });

  it("treats 0 as remove, not clamp-up-to-min", () => {
    expect(clampQuantity(0, bounds)).toBe(0);
  });

  it("treats a negative quantity as remove", () => {
    expect(clampQuantity(-3, bounds)).toBe(0);
  });
});

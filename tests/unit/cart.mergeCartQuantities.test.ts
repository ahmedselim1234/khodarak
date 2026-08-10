import { describe, expect, it } from "vitest";
import { mergeCartQuantities } from "@/lib/cart/mergeCartQuantities";

const bounds = { minQty: 1, maxQty: 10 };

describe("mergeCartQuantities", () => {
  it("uses the incoming quantity when there is no existing row (guest-only)", () => {
    expect(mergeCartQuantities(undefined, 3, bounds)).toBe(3);
  });

  it("keeps the existing quantity when the incoming quantity is lower (account-only wins)", () => {
    expect(mergeCartQuantities(5, 2, bounds)).toBe(5);
  });

  it("takes the incoming quantity when it is higher than the existing one", () => {
    expect(mergeCartQuantities(2, 5, bounds)).toBe(5);
  });

  it("caps the merged result at maxQty", () => {
    expect(mergeCartQuantities(9, 15, bounds)).toBe(10);
  });

  it("returns 0 when both sides are 0", () => {
    expect(mergeCartQuantities(0, 0, bounds)).toBe(0);
  });
});

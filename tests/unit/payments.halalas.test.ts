import { describe, expect, it } from "vitest";
import { toHalalas } from "@/lib/payments/halalas";

describe("toHalalas", () => {
  it("converts a whole-riyal amount correctly", () => {
    expect(toHalalas(10)).toBe(1000);
  });

  it("converts a two-decimal amount correctly", () => {
    expect(toHalalas(12.5)).toBe(1250);
    expect(toHalalas(59.5)).toBe(5950);
  });

  it("does not silently produce the classic 100x error", () => {
    // A naive `amount * 100` done with floating point can drift (e.g.
    // 0.1 * 100 !== 10 in raw IEEE 754); toHalalas must round to the
    // nearest integer halala rather than propagate that drift.
    expect(toHalalas(0.1)).toBe(10);
    expect(toHalalas(19.99)).toBe(1999);
  });

  it("rounds a fractional-halala result to the nearest integer", () => {
    expect(toHalalas(12.005)).toBe(1201); // 1200.5 -> rounds up
  });

  it("throws on a non-positive amount", () => {
    expect(() => toHalalas(0)).toThrow();
    expect(() => toHalalas(-5)).toThrow();
  });
});

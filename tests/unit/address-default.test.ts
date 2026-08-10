import { describe, expect, it } from "vitest";
import {
  resolveDefaultAfterDelete,
  resolveDefaultTransition,
  shouldAutoDefault,
} from "@/lib/addresses/defaultInvariant";

describe("shouldAutoDefault", () => {
  it("auto-defaults a customer's first address", () => {
    expect(shouldAutoDefault(0)).toBe(true);
  });

  it("does not auto-default a second or later address", () => {
    expect(shouldAutoDefault(1)).toBe(false);
    expect(shouldAutoDefault(5)).toBe(false);
  });
});

describe("resolveDefaultTransition", () => {
  it("unsets the previous default and sets the new one", () => {
    const addresses = [
      { id: "a", isDefault: true },
      { id: "b", isDefault: false },
    ];

    const updates = resolveDefaultTransition(addresses, "b");

    expect(updates).toEqual(
      expect.arrayContaining([
        { id: "a", isDefault: false },
        { id: "b", isDefault: true },
      ])
    );
    expect(updates).toHaveLength(2);
  });

  it("is a no-op when the target is already the default", () => {
    const addresses = [
      { id: "a", isDefault: true },
      { id: "b", isDefault: false },
    ];

    expect(resolveDefaultTransition(addresses, "a")).toEqual([]);
  });

  it("handles a customer with no prior default", () => {
    const addresses = [
      { id: "a", isDefault: false },
      { id: "b", isDefault: false },
    ];

    expect(resolveDefaultTransition(addresses, "a")).toEqual([{ id: "a", isDefault: true }]);
  });
});

describe("resolveDefaultAfterDelete", () => {
  it("does not auto-promote another address to default", () => {
    const remaining = [{ id: "b", isDefault: false }];
    expect(resolveDefaultAfterDelete(remaining)).toEqual(remaining);
  });

  it("returns an empty list unchanged when no addresses remain", () => {
    expect(resolveDefaultAfterDelete([])).toEqual([]);
  });
});

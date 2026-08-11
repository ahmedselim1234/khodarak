import { describe, expect, it } from "vitest";
import { isValidOrderStatusTransition } from "@/lib/orders/orderStatusTransition";

describe("isValidOrderStatusTransition", () => {
  it("allows pending -> out_for_delivery", () => {
    expect(isValidOrderStatusTransition("pending", "out_for_delivery")).toBe(true);
  });

  it("allows out_for_delivery -> delivered", () => {
    expect(isValidOrderStatusTransition("out_for_delivery", "delivered")).toBe(true);
  });

  it("allows pending -> cancelled", () => {
    expect(isValidOrderStatusTransition("pending", "cancelled")).toBe(true);
  });

  it("allows out_for_delivery -> cancelled", () => {
    expect(isValidOrderStatusTransition("out_for_delivery", "cancelled")).toBe(true);
  });

  it("rejects pending -> delivered (skipping out_for_delivery)", () => {
    expect(isValidOrderStatusTransition("pending", "delivered")).toBe(false);
  });

  it("rejects any move from delivered", () => {
    expect(isValidOrderStatusTransition("delivered", "cancelled")).toBe(false);
    expect(isValidOrderStatusTransition("delivered", "pending")).toBe(false);
    expect(isValidOrderStatusTransition("delivered", "out_for_delivery")).toBe(false);
  });

  it("rejects any backward move", () => {
    expect(isValidOrderStatusTransition("out_for_delivery", "pending")).toBe(false);
  });

  it("rejects any move from cancelled", () => {
    expect(isValidOrderStatusTransition("cancelled", "pending")).toBe(false);
    expect(isValidOrderStatusTransition("cancelled", "out_for_delivery")).toBe(false);
  });

  it("rejects a no-op move to the same status", () => {
    expect(isValidOrderStatusTransition("pending", "pending")).toBe(false);
  });
});

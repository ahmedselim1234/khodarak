import { describe, expect, it } from "vitest";
import {
  shouldProcessOutcome,
  shouldBeDefaultPaymentMethod,
} from "@/lib/payments/paymentOutcomeDecisions";

describe("shouldProcessOutcome", () => {
  it("proceeds when the payment is still 'initiated'", () => {
    expect(shouldProcessOutcome("initiated")).toBe(true);
  });

  it("does not proceed when the payment is already 'paid' (idempotency)", () => {
    expect(shouldProcessOutcome("paid")).toBe(false);
  });

  it("does not proceed when the payment is already 'failed' (a terminal state is never overwritten)", () => {
    expect(shouldProcessOutcome("failed")).toBe(false);
  });
});

describe("shouldBeDefaultPaymentMethod", () => {
  it("is the default when the customer has no existing active payment method", () => {
    expect(shouldBeDefaultPaymentMethod(0)).toBe(true);
  });

  it("is not the default when the customer already has an active payment method", () => {
    expect(shouldBeDefaultPaymentMethod(1)).toBe(false);
    expect(shouldBeDefaultPaymentMethod(3)).toBe(false);
  });
});

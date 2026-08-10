import { describe, expect, it } from "vitest";
import { isValidWebhookSignature } from "@/lib/payments/verifyWebhookSignature";

const SECRET = "correct-secret-token";

describe("isValidWebhookSignature", () => {
  it("accepts the correct secret token", () => {
    expect(isValidWebhookSignature(SECRET, SECRET)).toBe(true);
  });

  it("rejects an incorrect secret token", () => {
    expect(isValidWebhookSignature("wrong-token", SECRET)).toBe(false);
  });

  it("rejects a missing header value", () => {
    expect(isValidWebhookSignature(null, SECRET)).toBe(false);
    expect(isValidWebhookSignature(undefined, SECRET)).toBe(false);
  });

  it("rejects an empty header value", () => {
    expect(isValidWebhookSignature("", SECRET)).toBe(false);
  });

  it("rejects a header value that differs only in length", () => {
    expect(isValidWebhookSignature(SECRET + "x", SECRET)).toBe(false);
  });
});

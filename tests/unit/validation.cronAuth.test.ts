import { describe, expect, it } from "vitest";
import { isValidCronAuth } from "@/lib/validation/cronAuth";

const SECRET = "correct-cron-secret";

describe("isValidCronAuth", () => {
  it("accepts a correctly-formed bearer header with the correct secret", () => {
    expect(isValidCronAuth(`Bearer ${SECRET}`, SECRET)).toBe(true);
  });

  it("rejects an incorrect secret", () => {
    expect(isValidCronAuth("Bearer wrong-secret", SECRET)).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(isValidCronAuth(null, SECRET)).toBe(false);
    expect(isValidCronAuth(undefined, SECRET)).toBe(false);
  });

  it("rejects a header missing the Bearer prefix", () => {
    expect(isValidCronAuth(SECRET, SECRET)).toBe(false);
  });

  it("rejects a header value that differs only in length", () => {
    expect(isValidCronAuth(`Bearer ${SECRET}x`, SECRET)).toBe(false);
  });
});

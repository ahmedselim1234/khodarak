import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";

describe("signupSchema", () => {
  const validInput = {
    fullName: "أحمد بن خالد",
    phone: "0512345678",
    email: "user@example.com",
    password: "correct-horse",
  };

  it("accepts a fully valid signup payload", () => {
    expect(signupSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts an international-format KSA phone number", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      phone: "+966512345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a password below the minimum strength", () => {
    const result = signupSchema.safeParse({ ...validInput, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty full name", () => {
    const result = signupSchema.safeParse({ ...validInput, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that is not KSA mobile format", () => {
    const result = signupSchema.safeParse({ ...validInput, phone: "+1234567890" });
    expect(result.success).toBe(false);
  });

  it("rejects a landline-shaped local number (wrong prefix)", () => {
    const result = signupSchema.safeParse({ ...validInput, phone: "0112345678" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "anything" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  it("rejects an empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a password meeting the minimum strength", () => {
    expect(resetPasswordSchema.safeParse({ password: "new-password-123" }).success).toBe(true);
  });

  it("rejects a password below the minimum strength", () => {
    expect(resetPasswordSchema.safeParse({ password: "short" }).success).toBe(false);
  });
});

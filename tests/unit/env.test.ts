import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY: "pk_test_example",
};

describe("parsePublicEnv", () => {
  it("returns the parsed values when all required vars are present and valid", () => {
    const result = parsePublicEnv(validEnv);

    expect(result).toEqual(validEnv);
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_URL when it is missing", () => {
    const { NEXT_PUBLIC_SUPABASE_URL: _omit, ...rest } = validEnv;
    expect(() => parsePublicEnv(rest)).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_URL when it is not a valid URL", () => {
    expect(() =>
      parsePublicEnv({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_ANON_KEY when it is missing", () => {
    const { NEXT_PUBLIC_SUPABASE_ANON_KEY: _omit, ...rest } = validEnv;
    expect(() => parsePublicEnv(rest)).toThrowError(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it("throws naming NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY when it is missing", () => {
    const { NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY: _omit, ...rest } = validEnv;
    expect(() => parsePublicEnv(rest)).toThrowError(/NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY/);
  });

  it("throws naming all fields when all are missing", () => {
    expect(() => parsePublicEnv({})).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY.*NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY/
    );
  });
});

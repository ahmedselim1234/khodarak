import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("returns the parsed values when both required vars are present and valid", () => {
    const result = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(result).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_URL when it is missing", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      })
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_URL when it is not a valid URL", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      })
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_ANON_KEY when it is missing", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      })
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it("throws naming both fields when both are missing", () => {
    expect(() => parsePublicEnv({})).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/
    );
  });
});

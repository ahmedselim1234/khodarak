import { z } from "zod";

/**
 * Public env vars only — safe to import from browser code. Server-only
 * secrets (e.g. the Supabase service role key) live in lib/env.server.ts,
 * which must never be imported from client components.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required")
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY is required"),
  // The canonical public origin. Required with no fallback on purpose: a
  // silent default would send password-reset emails pointing at the wrong
  // domain, which looks like a working deploy until someone clicks the link.
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SITE_URL is required")
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .transform((value) => value.replace(/\/+$/, "")),
});

export function parsePublicEnv(source: Record<string, string | undefined>) {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY: source.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(
      `Invalid environment configuration — ${issues}. Check .env.local against .env.example.`
    );
  }

  return parsed.data;
}

// NEXT_PUBLIC_* vars must be referenced as literal `process.env.NEXT_PUBLIC_X`
// expressions for Next.js's bundler to statically inline them into the
// client bundle — passing the whole `process.env` object through (as this
// used to do) works server-side but silently becomes `undefined` in the
// browser, since `process.env` itself is not preserved client-side.
export const env = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

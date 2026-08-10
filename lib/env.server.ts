import "server-only";
import { z } from "zod";
import { parsePublicEnv } from "@/lib/env";

const serverOnlySchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

function loadServerEnv() {
  const publicEnv = parsePublicEnv(process.env);

  const parsed = serverOnlySchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(
      `Invalid environment configuration — ${issues}. Check .env.local against .env.example.`
    );
  }

  return { ...publicEnv, ...parsed.data };
}

/**
 * Full env (public + service role key). Server-only — importing this from a
 * Client Component fails the build via the `server-only` package.
 */
export const serverEnv = loadServerEnv();

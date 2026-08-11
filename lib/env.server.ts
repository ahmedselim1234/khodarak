import "server-only";
import { z } from "zod";
import { parsePublicEnv } from "@/lib/env";

const serverOnlySchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  MOYASAR_SECRET_KEY: z.string().min(1, "MOYASAR_SECRET_KEY is required"),
  MOYASAR_WEBHOOK_SECRET: z.string().min(1, "MOYASAR_WEBHOOK_SECRET is required"),
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),
});

function loadServerEnv() {
  const publicEnv = parsePublicEnv(process.env);

  const parsed = serverOnlySchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MOYASAR_SECRET_KEY: process.env.MOYASAR_SECRET_KEY,
    MOYASAR_WEBHOOK_SECRET: process.env.MOYASAR_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
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
 * Full env (public + service role key + Moyasar secrets). Server-only —
 * importing this from a Client Component fails the build via the
 * `server-only` package.
 */
export const serverEnv = loadServerEnv();

import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";

// Lightweight reachability check per contracts/health-check.md. Distinct from
// the startup-time env validation (instrumentation.ts) — this checks that
// the configured Supabase project is actually reachable at request time, via
// Supabase Auth's own health endpoint (no application table required, since
// this phase creates none).
export async function GET() {
  try {
    const response = await fetch(
      `${serverEnv.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          supabase: "unreachable",
          detail: `Supabase responded with status ${response.status}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "ok", supabase: "reachable" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { status: "error", supabase: "unreachable", detail },
      { status: 503 }
    );
  }
}

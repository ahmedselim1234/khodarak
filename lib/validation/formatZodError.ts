import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Shared zod-issue → 400 response formatter, extracted from the identical
// 4-line block previously repeated in 20 Route Handler files (Phase 11,
// research.md §1.2). Doesn't change any schema's own validation rules —
// only centralizes how the failure is shaped into a response.
export function formatZodFieldErrors(error: ZodError): NextResponse {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    // A top-level `.refine()` failure has an empty path — falls back to a
    // "form" key rather than the literal string "undefined" (the one real
    // divergence the 20 call sites this helper consolidates ever had,
    // app/api/subscriptions/[id]/pay/route.ts — now the universal behavior).
    fields[String(issue.path[0] ?? "form")] = issue.message;
  }
  return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
}

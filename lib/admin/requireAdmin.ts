import { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

// Shared admin auth+role check — extracted from the identical inline logic
// previously duplicated in app/api/admin/products/*/route.ts and
// app/api/admin/settings/route.ts (Phase 2/3), now also used by every new
// admin Route Handler this phase adds. App-layer defense in depth, not the
// actual authorization boundary — the admin-role-checking RLS policy
// underneath every query is (Constitution Principle V, research.md §1).
export async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "unauthenticated" }, { status: 401 }), userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: user.id };
}

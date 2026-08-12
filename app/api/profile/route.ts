import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/profileUpdate";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

// PATCH /api/profile — per contracts/settings-api.md (FR-023). Uses the
// existing owner-scoped RLS client (profiles_update_own, Phase 1) — no
// service-role client needed. profiles_role_immutable's trigger already
// guarantees `role` can't change even if a crafted body tried to include it.
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = profileUpdateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: result.data.fullName, phone: result.data.phone })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ fullName: result.data.fullName, phone: result.data.phone });
}

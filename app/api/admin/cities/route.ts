import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { cityCreateSchema } from "@/lib/validation/city";

// POST /api/admin/cities — per contracts/admin-payments-and-cities-api.md.
// Uses the caller's own RLS-scoped client (cities_insert_admin policy) —
// never service-role.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = cityCreateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cities")
    .insert({
      name_ar: result.data.nameAr,
      is_active: result.data.isActive,
      delivery_fee_override: result.data.deliveryFeeOverride ?? null,
    })
    .select("id, name_ar, is_active, delivery_fee_override")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      city: {
        id: data.id,
        nameAr: data.name_ar,
        isActive: data.is_active,
        deliveryFeeOverride: data.delivery_fee_override,
      },
    },
    { status: 201 }
  );
}

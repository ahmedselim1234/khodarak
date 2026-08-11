import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { cityUpdateSchema } from "@/lib/validation/city";

// PATCH /api/admin/cities/[id] — per contracts/admin-payments-and-cities-api.md.
// Deactivating takes effect immediately for the customer-facing address
// form's city options (FR-014) — AddressForm's own existing city query
// already filters is_active = true (Phase 1, unchanged); never alters any
// existing address that already references this city.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = cityUpdateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { nameAr, isActive, deliveryFeeOverride } = result.data;

  const { data, error } = await supabase
    .from("cities")
    .update({
      ...(nameAr !== undefined && { name_ar: nameAr }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(deliveryFeeOverride !== undefined && { delivery_fee_override: deliveryFeeOverride }),
    })
    .eq("id", id)
    .select("id, name_ar, is_active, delivery_fee_override")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    city: {
      id: data.id,
      nameAr: data.name_ar,
      isActive: data.is_active,
      deliveryFeeOverride: data.delivery_fee_override,
    },
  });
}

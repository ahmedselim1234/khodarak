import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { deliveryIntervalUpdateSchema } from "@/lib/validation/deliveryInterval";

// PATCH /api/admin/delivery-intervals/[id] — per
// contracts/delivery-intervals-admin-api.md. `days` is never accepted here
// — immutable after creation (FR-002 only ever describes editing the
// discount). Deactivating (isActive: false) is the only removal mechanism
// (no delete route exists) — never alters any subscription already using it.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = deliveryIntervalUpdateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { discountPercent, isActive } = result.data;

  const { data, error } = await supabase
    .from("delivery_intervals")
    .update({
      ...(discountPercent !== undefined && { discount_percent: discountPercent }),
      ...(isActive !== undefined && { is_active: isActive }),
    })
    .eq("id", id)
    .select("id, days, discount_percent, is_active")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "duplicate_days" }, { status: 422 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    interval: {
      id: data.id,
      days: data.days,
      discountPercent: Number(data.discount_percent),
      isActive: data.is_active,
    },
  });
}

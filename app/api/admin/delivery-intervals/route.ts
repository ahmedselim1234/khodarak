import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { deliveryIntervalCreateSchema } from "@/lib/validation/deliveryInterval";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

// POST /api/admin/delivery-intervals — per contracts/delivery-intervals-admin-api.md.
// Uses the caller's own RLS-scoped client (delivery_intervals_insert_admin
// policy) — never service-role, mirroring the cities admin CRUD pattern.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = deliveryIntervalCreateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { data, error } = await supabase
    .from("delivery_intervals")
    .insert({
      days: result.data.days,
      discount_percent: result.data.discountPercent,
    })
    .select("id, days, discount_percent, is_active")
    .single();

  if (error) {
    // FR-001/Acceptance Scenario 3: partial unique index on (days) where
    // is_active — a duplicate active day count is a 23505 unique violation.
    if (error.code === "23505") {
      return NextResponse.json({ error: "duplicate_days" }, { status: 422 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      interval: {
        id: data.id,
        days: data.days,
        discountPercent: Number(data.discount_percent),
        isActive: data.is_active,
      },
    },
    { status: 201 }
  );
}

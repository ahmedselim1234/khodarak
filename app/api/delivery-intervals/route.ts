import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { estimateDeliveriesPerMonth } from "@/lib/pricing/deliveryInterval";

// GET /api/delivery-intervals — per
// contracts/delivery-intervals-public-api.md. Public, unauthenticated (like
// POST /api/pricing/preview) — active intervals only, ordered by days.
export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("delivery_intervals")
    .select("id, days, discount_percent")
    .eq("is_active", true)
    .order("days");

  const intervals = (data ?? []).map((row) => ({
    id: row.id,
    days: row.days,
    discountPercent: Number(row.discount_percent),
    estimatedDeliveriesPerMonth: estimateDeliveriesPerMonth(row.days),
  }));

  return NextResponse.json({ intervals });
}

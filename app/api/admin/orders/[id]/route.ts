import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { adminOrderStatusSchema } from "@/lib/validation/adminOrderStatus";
import { isValidOrderStatusTransition, type OrderStatus } from "@/lib/orders/orderStatusTransition";

// PATCH /api/admin/orders/[id] — per contracts/admin-orders-api.md.
// Enforces the strict forward-progression rule (FR-003) and a
// conditional-update guard against a concurrent edit (research.md §3).
// Uses the caller's own RLS-scoped client (orders_update_admin policy) —
// never service-role (research.md §1).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError, userId } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = adminOrderStatusSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { data: order } = await supabase.from("orders").select("id, status").eq("id", id).maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const currentStatus = order.status as OrderStatus;
  const requestedStatus = result.data.status;

  if (!isValidOrderStatusTransition(currentStatus, requestedStatus)) {
    return NextResponse.json(
      { error: "invalid_transition", from: currentStatus, to: requestedStatus },
      { status: 422 }
    );
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: requestedStatus,
      status_updated_by: userId,
      status_updated_at: new Date().toISOString(),
      ...(requestedStatus === "delivered" && { delivered_at: new Date().toISOString() }),
    })
    .eq("id", id)
    .eq("status", currentStatus)
    .select("status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!updated) {
    // Someone else already changed it between our read and this write
    // (research.md §3's own named edge case).
    const { data: refreshed } = await supabase.from("orders").select("status").eq("id", id).single();
    return NextResponse.json(
      { error: "status_changed", currentStatus: refreshed?.status },
      { status: 409 }
    );
  }

  return NextResponse.json({ status: updated.status });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { pauseSubscription } from "@/lib/subscription/mutateSubscription";
import { adminSubscriptionPauseSchema } from "@/lib/validation/adminSubscriptionAction";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

// POST /api/admin/subscriptions/[id]/pause — per contracts/admin-subscriptions-api.md.
// Reuses the existing service-role pauseSubscription() (Phase 6/7) rather
// than a new admin RLS write path on subscriptions (research.md §2) —
// requireAdmin() is this route's own authorization boundary before
// delegating into it.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError, userId } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = adminSubscriptionPauseSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (subscription.status === "paused") {
    return NextResponse.json({ error: "already_paused" }, { status: 409 });
  }
  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  await pauseSubscription({
    subscriptionId: id,
    resumeDate: result.data.resumeDate ?? null,
    adminId: userId!,
    reason: result.data.reason,
  });

  return NextResponse.json({ status: "paused", pausedUntil: result.data.resumeDate ?? null });
}

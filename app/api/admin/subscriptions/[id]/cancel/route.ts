import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { cancelSubscription } from "@/lib/subscription/mutateSubscription";
import { adminSubscriptionCancelSchema } from "@/lib/validation/adminSubscriptionAction";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

// POST /api/admin/subscriptions/[id]/cancel — per contracts/admin-subscriptions-api.md.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError, userId } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = adminSubscriptionCancelSchema.safeParse(body);

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
  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  await cancelSubscription(id, { adminId: userId!, reason: result.data.reason });

  return NextResponse.json({ status: "cancelled" });
}

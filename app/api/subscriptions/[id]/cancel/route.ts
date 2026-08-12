import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/subscription/mutateSubscription";
import { subscriptionCancelSchema } from "@/lib/validation/subscriptionPause";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

// POST /api/subscriptions/[id]/cancel — per contracts/pause-resume-cancel-api.md.
// Immediate — bypasses the edit cutoff lock, terminal (FR-014).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = subscriptionCancelSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  await cancelSubscription(subscription.id);

  return NextResponse.json({ status: "cancelled" });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeSubscription } from "@/lib/subscription/mutateSubscription";
import { selectableDeliveryDates } from "@/lib/subscription/selectableDeliveryDates";
import { RESUME_SETTINGS_SELECT } from "@/lib/pricing/settingsSelect";

// POST /api/subscriptions/[id]/resume — per contracts/pause-resume-cancel-api.md.
// Early resume (FR-012): recalculates next_delivery_date from now, not from
// whatever it was before the pause.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
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

  if (subscription.status !== "paused") {
    return NextResponse.json({ error: "not_paused" }, { status: 409 });
  }

  const { data: settingsRow } = await supabase
    .from("settings")
    .select(RESUME_SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  const leadDays = settingsRow?.first_delivery_lead_days ?? 1;
  const blackoutWeekdays = settingsRow?.blackout_weekdays ?? [];

  const dates = selectableDeliveryDates(new Date(), {
    leadDays,
    blackoutWeekdays,
    horizonDays: leadDays + 14,
  });
  const nextDeliveryDate = dates[0];

  if (!nextDeliveryDate) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  await resumeSubscription({ subscriptionId: subscription.id, nextDeliveryDate });

  return NextResponse.json({ status: "active", nextDeliveryDate });
}

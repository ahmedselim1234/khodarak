import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pauseSubscription } from "@/lib/subscription/mutateSubscription";
import { pauseEligibility } from "@/lib/subscription/pauseEligibility";
import { subscriptionPauseSchema } from "@/lib/validation/subscriptionPause";

const SETTINGS_SELECT = "max_pause_days, max_pauses_per_year";

// POST /api/subscriptions/[id]/pause — per contracts/pause-resume-cancel-api.md.
// Immediate — bypasses the edit cutoff lock entirely (spec.md Clarification
// 4, FR-010).
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
  const result = subscriptionPauseSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
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

  if (subscription.status === "paused") {
    return NextResponse.json({ error: "already_paused" }, { status: 409 });
  }
  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  const [{ data: settingsRow }, { data: pastPauses }] = await Promise.all([
    supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single(),
    supabase
      .from("subscription_pauses")
      .select("started_at")
      .eq("subscription_id", subscription.id),
  ]);

  if (!settingsRow) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const eligibility = pauseEligibility({
    now: new Date(),
    resumeDate: result.data.resumeDate,
    pastPauses: (pastPauses ?? []).map((row) => ({ startedAt: row.started_at })),
    maxPauseDays: settingsRow.max_pause_days,
    maxPausesPerYear: settingsRow.max_pauses_per_year,
  });

  if (!eligibility.allowed) {
    return NextResponse.json(
      { error: "pause_limit_exceeded", limit: eligibility.limit },
      { status: 422 }
    );
  }

  await pauseSubscription({ subscriptionId: subscription.id, resumeDate: result.data.resumeDate });

  return NextResponse.json({ status: "paused", pausedUntil: result.data.resumeDate });
}

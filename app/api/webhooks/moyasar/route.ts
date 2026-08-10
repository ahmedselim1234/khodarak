import { NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/payments/verifyWebhookSignature";
import { moyasarWebhookSchema } from "@/lib/validation/moyasarWebhook";
import { processPaymentOutcome } from "@/lib/payments/processPaymentOutcome";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { serverEnv } from "@/lib/env.server";

const ACTIONABLE_TYPES = new Set(["payment_paid", "payment_failed"]);

// POST /api/webhooks/moyasar — public, no session
// (contracts/payment-callback-and-webhook.md). Signature verified before
// anything in the body is trusted; deduplicated via webhook_events'
// unique moyasar_event_id.
export async function POST(request: Request) {
  const signatureHeader = request.headers.get("x-moyasar-token");

  if (!isValidWebhookSignature(signatureHeader, serverEnv.MOYASAR_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = moyasarWebhookSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const { id: moyasarEventId, type, data } = result.data;
  const supabase = createServiceRoleClient();

  const { error: insertError } = await supabase.from("webhook_events").insert({
    moyasar_event_id: moyasarEventId,
    type,
    payload: result.data,
  });

  if (insertError) {
    // Unique-constraint conflict = already received this exact event
    // (FR-013) — acknowledge without reprocessing.
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (ACTIONABLE_TYPES.has(type)) {
    const verifiedStatus = data.status === "paid" ? "paid" : "failed";
    await processPaymentOutcome(data.id, verifiedStatus, result.data);
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("moyasar_event_id", moyasarEventId);

  return NextResponse.json({ received: true });
}

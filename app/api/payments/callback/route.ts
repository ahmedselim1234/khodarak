import { NextResponse } from "next/server";
import { fetchPayment } from "@/lib/payments/moyasarClient";
import { processPaymentOutcome } from "@/lib/payments/processPaymentOutcome";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

// GET /api/payments/callback — Moyasar's 3DS redirect target
// (contracts/payment-callback-and-webhook.md). The query string's own
// status is read only for context, never as proof — this handler always
// calls Moyasar directly for the authoritative outcome (FR-005).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const moyasarPaymentId = url.searchParams.get("id");

  if (!moyasarPaymentId) {
    return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });
  }

  let verifiedStatus: "paid" | "failed";
  let rawResponse: unknown;
  try {
    const payment = await fetchPayment(moyasarPaymentId);
    rawResponse = payment;
    verifiedStatus = payment.status === "paid" ? "paid" : "failed";
  } catch {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  await processPaymentOutcome(moyasarPaymentId, verifiedStatus, rawResponse);

  const supabase = createServiceRoleClient();
  const { data: paymentRow } = await supabase
    .from("payments")
    .select("subscription_id")
    .eq("moyasar_payment_id", moyasarPaymentId)
    .maybeSingle();

  if (!paymentRow?.subscription_id) {
    return NextResponse.redirect(new URL("/subscription", request.url));
  }

  return NextResponse.redirect(
    new URL(`/subscription/confirmed/${paymentRow.subscription_id}`, request.url)
  );
}

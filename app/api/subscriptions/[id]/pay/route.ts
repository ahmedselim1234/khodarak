import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentInitiateSchema } from "@/lib/validation/paymentInitiate";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";
import { toHalalas } from "@/lib/payments/halalas";
import { isThrottled } from "@/lib/payments/retryThrottle";
import { createPayment } from "@/lib/payments/moyasarClient";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

const THROTTLE_OPTIONS = { maxAttempts: 5, windowMinutes: 15 };

// POST /api/subscriptions/[id]/pay — per contracts/pay-initiate-api.md.
// Never accepts an amount from the client — always computed from the
// subscription's own price_breakdown snapshot (Constitution Principle II).
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
  const result = paymentInitiateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, price_breakdown")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (subscription.status !== "pending_payment") {
    return NextResponse.json({ error: "not_pending" }, { status: 409 });
  }

  // FR-016a: throttle before ever calling Moyasar.
  const { data: recentFailures } = await supabase
    .from("payments")
    .select("created_at")
    .eq("subscription_id", id)
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(THROTTLE_OPTIONS.maxAttempts);

  if (
    isThrottled(
      (recentFailures ?? []).map((row) => row.created_at),
      new Date(),
      THROTTLE_OPTIONS
    )
  ) {
    return NextResponse.json(
      { error: "too_many_attempts", retryAfterSeconds: THROTTLE_OPTIONS.windowMinutes * 60 },
      { status: 429 }
    );
  }

  // Resolve the token to charge.
  let token: string;
  if (result.data.paymentMethodId) {
    const { data: method } = await supabase
      .from("payment_methods")
      .select("moyasar_token_id")
      .eq("id", result.data.paymentMethodId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!method) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    token = method.moyasar_token_id;
  } else {
    token = result.data.moyasarToken!;
  }

  const breakdown = subscription.price_breakdown as PriceBreakdown;
  const amountHalalas = toHalalas(breakdown.totalPerDelivery);

  const { count: priorAttempts } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("subscription_id", id);

  const callbackUrl = new URL("/api/payments/callback", request.url).toString();

  let moyasarPayment;
  try {
    moyasarPayment = await createPayment({
      amountHalalas,
      token,
      callbackUrl,
      subscriptionId: id,
    });
  } catch {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  const { error: insertError } = await supabase.from("payments").insert({
    subscription_id: id,
    user_id: user.id,
    moyasar_payment_id: moyasarPayment.id,
    amount_halalas: amountHalalas,
    status: "initiated",
    attempt_number: (priorAttempts ?? 0) + 1,
  });

  if (insertError) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const transactionUrl = moyasarPayment.source?.transaction_url;
  if (!transactionUrl) {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  return NextResponse.json({ transactionUrl });
}

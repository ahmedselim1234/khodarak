import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";
import { isValidCronAuth } from "@/lib/validation/cronAuth";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { claimSubscriptionForRenewal, selfHealOverduePause } from "@/lib/subscription/mutateSubscription";
import { repriceSubscriptionForRenewal } from "@/lib/subscription/reprice";
import { isCardExpiredByDate } from "@/lib/payments/cardExpiry";
import { createRecurringPayment } from "@/lib/payments/moyasarClient";
import { toHalalas } from "@/lib/payments/halalas";
import { processRenewalOutcome } from "@/lib/payments/processRenewalOutcome";

// POST /api/cron/renewals — the scheduled entry point (FR-001/FR-018), per
// contracts/cron-renewals-api.md. Never called by a customer's browser — no
// session, no cookies, no RLS-scoped client anywhere in this route.
export async function POST(request: Request) {
  if (!isValidCronAuth(request.headers.get("authorization"), serverEnv.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: dueSubscriptions } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("status", "active")
    .lte("next_renewal_attempt_date", today);

  // FR-010: a paused subscription whose resume date has already passed is
  // recognized independently by this job, in the same run — it doesn't
  // depend on the customer having opened their dashboard first.
  const { data: overduePauses } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("status", "paused")
    .lte("paused_until", today)
    .lte("next_renewal_attempt_date", today);

  for (const overdue of overduePauses ?? []) {
    await selfHealOverduePause(overdue.id);
  }

  const candidateIds = [
    ...(dueSubscriptions ?? []).map((s) => s.id),
    ...(overduePauses ?? []).map((s) => s.id),
  ];

  let renewed = 0;
  let retryScheduled = 0;
  let suspended = 0;

  for (const subscriptionId of candidateIds) {
    const { claimed } = await claimSubscriptionForRenewal(subscriptionId);
    if (!claimed) continue; // already claimed by a concurrent/overlapping run, or already resolved

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, user_id, next_delivery_date, renewal_attempt_count")
      .eq("id", subscriptionId)
      .single();

    if (!subscription) continue;

    const reprice = await repriceSubscriptionForRenewal(subscriptionId);

    let verifiedStatus: "paid" | "failed";
    let failureReason: string | undefined;
    let moyasarPaymentId: string | null = null;
    let rawResponse: unknown = null;

    if (!reprice.ok) {
      // FR-005: every product unavailable — no charge attempted.
      verifiedStatus = "failed";
      failureReason = "no_available_items";
    } else {
      const { data: paymentMethod } = await supabase
        .from("payment_methods")
        .select("moyasar_token_id, exp_month, exp_year")
        .eq("user_id", subscription.user_id)
        .eq("is_default", true)
        .eq("status", "active")
        .maybeSingle();

      if (!paymentMethod) {
        verifiedStatus = "failed";
        failureReason = "no_payment_method";
      } else if (isCardExpiredByDate(
        { expMonth: paymentMethod.exp_month, expYear: paymentMethod.exp_year },
        subscription.next_delivery_date
      )) {
        // FR-006: don't attempt a charge known in advance to fail.
        verifiedStatus = "failed";
        failureReason = "card_expired";
      } else {
        const cycleNumber = subscription.renewal_attempt_count + 1;
        try {
          const response = await createRecurringPayment({
            amountHalalas: toHalalas(reprice.breakdown.totalPerDelivery),
            token: paymentMethod.moyasar_token_id,
            subscriptionId,
            cycleNumber,
          });
          rawResponse = response;
          moyasarPaymentId = response.id;
          verifiedStatus = response.status === "paid" ? "paid" : "failed";
          failureReason = verifiedStatus === "failed" ? "declined" : undefined;
        } catch (err) {
          // Request-level failure (network/timeout/non-2xx) — spec.md
          // Clarification 4: treated exactly like a decline. Logged
          // explicitly (Phase 9 audit, FR-010) — this catch deliberately
          // turns the failure into a business outcome (a recorded, retried
          // payment attempt) rather than letting it propagate, which means
          // it would otherwise never reach any framework-level error
          // reporting the way an unhandled throw would.
          console.error(
            `[cron/renewals] Moyasar provider error for subscription ${subscriptionId}, cycle ${cycleNumber}:`,
            err
          );
          verifiedStatus = "failed";
          failureReason = "provider_error";
        }
      }
    }

    const { data: paymentRow } = await supabase
      .from("payments")
      .insert({
        subscription_id: subscriptionId,
        user_id: subscription.user_id,
        kind: "renewal",
        moyasar_payment_id: moyasarPaymentId,
        amount_halalas: reprice.ok ? toHalalas(reprice.breakdown.totalPerDelivery) : null,
        status: "initiated",
        attempt_number: subscription.renewal_attempt_count + 1,
        // Durable record of what this attempt was re-priced for
        // (research.md §1/§6) — read back by processRenewalOutcome.ts's
        // 'paid' branch regardless of which path resolves the outcome.
        renewal_charge_context: reprice.ok
          ? {
              frequency: reprice.frequency,
              deliveryIntervalId: reprice.deliveryIntervalId,
              deliveryIntervalDays: reprice.deliveryIntervalDays,
              deliveryIntervalDiscountPercent: reprice.deliveryIntervalDiscountPercent,
              addressId: reprice.addressId,
              items: reprice.items,
              breakdown: reprice.breakdown,
              pendingResolved: reprice.pendingResolved,
            }
          : null,
      })
      .select("id")
      .single();

    if (!paymentRow) continue;

    await processRenewalOutcome(paymentRow.id, verifiedStatus, rawResponse, failureReason);

    if (verifiedStatus === "paid") {
      renewed += 1;
    } else {
      const { data: refreshed } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("id", subscriptionId)
        .single();
      if (refreshed?.status === "paused") {
        suspended += 1;
      } else {
        retryScheduled += 1;
      }
    }
  }

  return NextResponse.json({
    considered: candidateIds.length,
    renewed,
    retryScheduled,
    suspended,
  });
}

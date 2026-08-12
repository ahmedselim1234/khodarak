import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { advanceDeliveryDate, advanceDeliveryDateByInterval } from "@/lib/subscription/advanceDeliveryDate";
import { nextRetryOrSuspend } from "@/lib/payments/dunningSchedule";
import type { PriceBreakdown } from "@/lib/pricing/calculate";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";

type VerifiedStatus = "paid" | "failed";
type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

export type RenewalChargeContext = {
  frequency: FrequencyKey | "custom_interval";
  // Present iff frequency === "custom_interval" (Phase 10,
  // contracts/renewal-interval-advance.md).
  deliveryIntervalId?: string;
  deliveryIntervalDays?: number;
  deliveryIntervalDiscountPercent?: number;
  addressId: string;
  items: Array<{ productId: string; quantity: number }>;
  breakdown: PriceBreakdown;
  pendingResolved: boolean;
};

// THE shared, idempotent renewal-resolution function — processPaymentOutcome.ts's sibling for
// recurring (not first) charges (specs/008-phase-7-renewal-engine/contracts/process-renewal-outcome.md).
// Called by both the cron route's own synchronous handling and the webhook route. Keyed by
// `payments.id` (not `moyasar_payment_id`) because three of the cron route's four outcome paths
// (no available items, expired card, provider error) never produce a Moyasar payment id at all —
// every renewal attempt still gets its own payments row and its own resolution (research.md §1).
export async function processRenewalOutcome(
  paymentId: string,
  verifiedStatus: VerifiedStatus,
  rawResponse: unknown,
  failureReason: string | undefined
): Promise<void> {
  const supabase = createServiceRoleClient();

  // Step 1 — the entire idempotency guarantee (mirrors processPaymentOutcome.ts, research.md
  // §1): only a still-'initiated' row is resolved here. A second/concurrent/redelivered call for
  // an already-terminal payment updates zero rows and returns.
  const { data: updatedPayments } = await supabase
    .from("payments")
    .update({ status: verifiedStatus, raw_response: rawResponse, failure_reason: failureReason ?? null })
    .eq("id", paymentId)
    .in("status", ["initiated"])
    .select("id, subscription_id, renewal_charge_context");

  const payment = updatedPayments?.[0];
  if (!payment || !payment.subscription_id) {
    // Already processed by an earlier call, or no matching payment at all.
    return;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, user_id, next_delivery_date, renewal_attempt_count")
    .eq("id", payment.subscription_id)
    .maybeSingle();

  if (!subscription) return;

  if (verifiedStatus === "paid") {
    // Read back from the durable row (research.md §1/§6) rather than a
    // caller-supplied parameter — whichever path resolves this outcome
    // first (the cron route's own synchronous handling, or a webhook
    // delivery racing ahead of it) has exactly the same data available.
    const context = payment.renewal_charge_context as RenewalChargeContext | null;
    if (!context) {
      throw new Error("processRenewalOutcome: 'paid' outcome has no renewal_charge_context");
    }
    await handleSuccessfulRenewal(supabase, payment.id, subscription, context);
    return;
  }

  await handleFailedRenewal(supabase, subscription.id, subscription.renewal_attempt_count);
}

async function handleSuccessfulRenewal(
  supabase: ServiceRoleClient,
  paymentId: string,
  subscription: { id: string; user_id: string; next_delivery_date: string },
  context: RenewalChargeContext
): Promise<void> {
  const [{ data: address }, { data: settingsRow }] = await Promise.all([
    supabase
      .from("addresses")
      .select("label, district, street_details, cities(name_ar)")
      .eq("id", context.addressId)
      .maybeSingle(),
    supabase.from("settings").select("blackout_weekdays").eq("id", 1).single(),
  ]);

  const cityRow = Array.isArray(address?.cities) ? address.cities[0] : address?.cities;

  // Step A — generate the order from this cycle's own freshly-computed
  // snapshot (never recalculated again later — FR-002/FR-008).
  const { data: order } = await supabase
    .from("orders")
    .insert({
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      address_snapshot: address
        ? {
            label: address.label,
            cityName: cityRow?.name_ar ?? null,
            district: address.district,
            streetDetails: address.street_details,
          }
        : {},
      status: "pending",
      scheduled_date: subscription.next_delivery_date,
      price_breakdown: context.breakdown,
    })
    .select("id")
    .single();

  if (order) {
    const productIds = context.items.map((item) => item.productId);
    const { data: products } =
      productIds.length > 0
        ? await supabase.from("products").select("id, name_ar, price").in("id", productIds)
        : { data: [] };
    const productById = new Map((products ?? []).map((product) => [product.id, product]));

    const orderItemRows = context.items.flatMap((item) => {
      const product = productById.get(item.productId);
      if (!product) return [];
      return [
        {
          order_id: order.id,
          product_id: item.productId,
          product_name_snapshot: product.name_ar,
          unit_price_snapshot: product.price,
          quantity: item.quantity,
        },
      ];
    });

    if (orderItemRows.length > 0) {
      await supabase.from("order_items").insert(orderItemRows);
    }

    await supabase.from("payments").update({ order_id: order.id }).eq("id", paymentId);
  }

  // Step B — this cycle's surviving items become the subscription's
  // current box, and — if this cycle resolved a due pending change
  // (Phase 6) — the pending columns are cleared (the concrete promotion
  // Phase 6's own research.md §1 deferred to this phase).
  await supabase.from("subscription_items").delete().eq("subscription_id", subscription.id);
  if (context.items.length > 0) {
    await supabase.from("subscription_items").insert(
      context.items.map((item) => ({
        subscription_id: subscription.id,
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );
  }

  // Step C — advance the cycle (FR-008): next_delivery_date moves forward
  // by exactly one frequency period from the delivery that just happened,
  // never from "today".
  const newNextDeliveryDate =
    context.frequency === "custom_interval"
      ? advanceDeliveryDateByInterval(
          subscription.next_delivery_date,
          context.deliveryIntervalDays!,
          settingsRow?.blackout_weekdays ?? []
        )
      : advanceDeliveryDate(subscription.next_delivery_date, context.frequency, settingsRow?.blackout_weekdays ?? []);

  const subscriptionUpdate: Record<string, unknown> = {
    frequency: context.frequency,
    address_id: context.addressId,
    next_delivery_date: newNextDeliveryDate,
    next_renewal_attempt_date: newNextDeliveryDate,
    renewal_attempt_count: 0,
    renewal_claimed_at: null,
  };

  // Phase 10: refresh the fallback snapshot to whatever discount this cycle
  // actually used (research.md §5) — untouched (no keys added) for a legacy
  // subscription.
  if (context.frequency === "custom_interval") {
    subscriptionUpdate.delivery_interval_id = context.deliveryIntervalId;
    subscriptionUpdate.delivery_interval_days = context.deliveryIntervalDays;
    subscriptionUpdate.delivery_interval_last_discount_percent = context.deliveryIntervalDiscountPercent;
  }

  if (context.pendingResolved) {
    subscriptionUpdate.pending_frequency = null;
    subscriptionUpdate.pending_address_id = null;
    subscriptionUpdate.pending_price_breakdown = null;
    subscriptionUpdate.pending_effective_from = null;
    await supabase.from("subscription_pending_items").delete().eq("subscription_id", subscription.id);
  }

  await supabase.from("subscriptions").update(subscriptionUpdate).eq("id", subscription.id);
}

async function handleFailedRenewal(
  supabase: ServiceRoleClient,
  subscriptionId: string,
  priorAttemptCount: number
): Promise<void> {
  const newAttemptCount = priorAttemptCount + 1;

  // firstFailedAt: this cycle's very first failed attempt's timestamp —
  // offsets are always from the original failure, never compounding from
  // the previous retry (research.md §4). When this IS the first failure,
  // "now" is correct; otherwise look up the earliest still-relevant failed
  // payment for this subscription.
  let firstFailedAt = new Date();
  if (priorAttemptCount > 0) {
    const { data: earliestFailure } = await supabase
      .from("payments")
      .select("created_at")
      .eq("subscription_id", subscriptionId)
      .eq("kind", "renewal")
      .eq("status", "failed")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (earliestFailure) firstFailedAt = new Date(earliestFailure.created_at);
  }

  const decision = nextRetryOrSuspend(newAttemptCount, firstFailedAt);

  if (decision.action === "retry") {
    await supabase
      .from("subscriptions")
      .update({
        renewal_attempt_count: newAttemptCount,
        next_renewal_attempt_date: decision.retryAt.toISOString().slice(0, 10),
        renewal_claimed_at: null,
      })
      .eq("id", subscriptionId);
    return;
  }

  // Suspend — reuses Phase 6's existing `paused` status with no resume
  // date (spec.md Clarification 2), distinguishing an automatic
  // suspension from a customer-chosen pause.
  await supabase
    .from("subscriptions")
    .update({
      status: "paused",
      paused_until: null,
      renewal_attempt_count: 0,
      next_renewal_attempt_date: null,
      renewal_claimed_at: null,
    })
    .eq("id", subscriptionId);

  await supabase.from("subscription_pauses").insert({
    subscription_id: subscriptionId,
    resume_date: null,
  });
}

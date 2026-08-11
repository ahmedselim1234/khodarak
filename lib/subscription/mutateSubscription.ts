import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { PriceBreakdown } from "@/lib/pricing/calculate";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";

type ItemInput = { productId: string; quantity: number };

// The one module allowed to write subscriptions/subscription_items/
// subscription_pending_items/subscription_pauses/payment_methods —
// exclusively via the service-role client, never an owner-scoped RLS write
// path (research.md §3, §5). Called only from
// app/api/subscriptions/[id]/* and app/api/payment-methods Route Handlers,
// each of which has already done its own auth/ownership/rule-validation
// before calling in here.

// POST /api/cron/renewals' claim step (Phase 7, specs/008-phase-7-renewal-engine/research.md
// §1): a single conditional UPDATE ... WHERE ... RETURNING — Postgres's own row-level locking
// makes this atomic without an application-level lock. Only the caller that gets a row back may
// proceed to charge this subscription; every other concurrent/retried invocation sees zero rows
// and skips it. A claim older than 10 minutes is treated as stale (a crashed run's dead-man's
// switch, not a normal state) and is reclaimable.
export async function claimSubscriptionForRenewal(
  subscriptionId: string
): Promise<{ claimed: boolean }> {
  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().slice(0, 10);
  const staleClaimBefore = new Date(Date.now() - 10 * 60_000).toISOString();

  const { data } = await supabase
    .from("subscriptions")
    .update({ renewal_claimed_at: new Date().toISOString() })
    .eq("id", subscriptionId)
    .eq("status", "active")
    .lte("next_renewal_attempt_date", today)
    .or(`renewal_claimed_at.is.null,renewal_claimed_at.lt.${staleClaimBefore}`)
    .select("id");

  return { claimed: (data?.length ?? 0) > 0 };
}

// GET /api/subscriptions/[id]'s self-heal (data-model.md's state-transitions
// note, FR-013): if a pause's resume date has already passed, flip the
// subscription back to active before anything reads it further. No-op if
// the subscription isn't overdue-paused.
export async function selfHealOverduePause(subscriptionId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().slice(0, 10);

  await supabase
    .from("subscriptions")
    .update({ status: "active", paused_until: null })
    .eq("id", subscriptionId)
    .eq("status", "paused")
    .lte("paused_until", today);
}

// PATCH .../route.ts, outside the cutoff: replaces the subscription's
// current items/frequency/address/price directly, and clears any prior
// pending change — a fresh in-cutoff edit supersedes an old deferred one
// (research.md §1).
export async function applyImmediateEdit(params: {
  subscriptionId: string;
  frequency: FrequencyKey;
  addressId: string;
  items: ItemInput[];
  priceBreakdown: PriceBreakdown;
  nextDeliveryDate: string;
}): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase
    .from("subscriptions")
    .update({
      frequency: params.frequency,
      address_id: params.addressId,
      price_breakdown: params.priceBreakdown,
      next_delivery_date: params.nextDeliveryDate,
      pending_frequency: null,
      pending_address_id: null,
      pending_price_breakdown: null,
      pending_effective_from: null,
    })
    .eq("id", params.subscriptionId);

  await supabase.from("subscription_items").delete().eq("subscription_id", params.subscriptionId);
  await supabase.from("subscription_pending_items").delete().eq("subscription_id", params.subscriptionId);

  if (params.items.length > 0) {
    await supabase.from("subscription_items").insert(
      params.items.map((item) => ({
        subscription_id: params.subscriptionId,
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );
  }
}

// PATCH .../route.ts, inside the cutoff (FR-009): writes the new
// configuration to the pending_* columns/subscription_pending_items only —
// the subscription's current fields, and therefore the already-locked next
// delivery, stay untouched. Always a full replace of any prior pending
// change, never a merge (research.md §1).
export async function savePendingEdit(params: {
  subscriptionId: string;
  frequency: FrequencyKey;
  addressId: string;
  items: ItemInput[];
  priceBreakdown: PriceBreakdown;
  effectiveFrom: string;
}): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase
    .from("subscriptions")
    .update({
      pending_frequency: params.frequency,
      pending_address_id: params.addressId,
      pending_price_breakdown: params.priceBreakdown,
      pending_effective_from: params.effectiveFrom,
    })
    .eq("id", params.subscriptionId);

  await supabase.from("subscription_pending_items").delete().eq("subscription_id", params.subscriptionId);

  if (params.items.length > 0) {
    await supabase.from("subscription_pending_items").insert(
      params.items.map((item) => ({
        subscription_id: params.subscriptionId,
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );
  }
}

// POST .../pause. Immediate — overrides the cutoff lock (spec.md
// Clarification 4, FR-010). Any existing pending change is left untouched;
// it still applies once the subscription is active again and
// pending_effective_from arrives.
//
// Phase 8 (specs/009-phase-8-admin-operations): also the admin pause path
// — `adminId`/`reason` are set only when an operator initiated it (stamped
// onto the same subscription_pauses row, data-model.md), and `resumeDate`
// becomes optional so an admin can leave a pause indefinite (customer
// pauses, Phase 6, always supply one).
export async function pauseSubscription(params: {
  subscriptionId: string;
  resumeDate?: string | null;
  adminId?: string;
  reason?: string;
}): Promise<void> {
  const supabase = createServiceRoleClient();
  const resumeDate = params.resumeDate ?? null;

  await supabase
    .from("subscriptions")
    .update({ status: "paused", paused_until: resumeDate })
    .eq("id", params.subscriptionId);

  await supabase.from("subscription_pauses").insert({
    subscription_id: params.subscriptionId,
    resume_date: resumeDate,
    initiated_by_admin_id: params.adminId ?? null,
    reason: params.reason ?? null,
  });
}

// POST .../resume (early resume, FR-012).
export async function resumeSubscription(params: {
  subscriptionId: string;
  nextDeliveryDate: string;
}): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase
    .from("subscriptions")
    .update({ status: "active", paused_until: null, next_delivery_date: params.nextDeliveryDate })
    .eq("id", params.subscriptionId);

  await supabase
    .from("subscription_pauses")
    .update({ resumed_early_at: new Date().toISOString() })
    .eq("subscription_id", params.subscriptionId)
    .is("resumed_early_at", null)
    .order("started_at", { ascending: false })
    .limit(1);
}

// POST .../cancel. Immediate — overrides the cutoff lock, terminal
// (FR-014).
//
// Phase 8: also the admin cancel path — `adminId`/`reason` set only when
// an operator initiated it (data-model.md).
export async function cancelSubscription(
  subscriptionId: string,
  admin?: { adminId: string; reason: string }
): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      pending_frequency: null,
      pending_address_id: null,
      pending_price_breakdown: null,
      pending_effective_from: null,
      ...(admin && { cancelled_by_admin_id: admin.adminId, cancel_reason: admin.reason }),
    })
    .eq("id", subscriptionId);
}

// POST /api/payment-methods (research.md §5): the caller's existing default
// card (if any) is marked removed/non-default, then the new one is
// inserted as the default. Card details are the caller's own already
// server-verified values (via moyasarClient.fetchPayment) — this function
// trusts them because the Route Handler already established that trust.
export async function replacePaymentMethod(params: {
  userId: string;
  moyasarTokenId: string;
  brand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
}): Promise<{ id: string }> {
  const supabase = createServiceRoleClient();

  await supabase
    .from("payment_methods")
    .update({ is_default: false, status: "removed" })
    .eq("user_id", params.userId)
    .eq("is_default", true);

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: params.userId,
      moyasar_token_id: params.moyasarTokenId,
      brand: params.brand,
      last_four: params.lastFour,
      exp_month: params.expMonth,
      exp_year: params.expYear,
      is_default: true,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`replacePaymentMethod: insert failed: ${error?.message}`);
  }

  return data;
}

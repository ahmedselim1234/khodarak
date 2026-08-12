import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { resolveEffectiveConfig } from "@/lib/subscription/resolveEffectiveConfig";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { calculate, type PriceBreakdown } from "@/lib/pricing/calculate";
import { estimateDeliveriesPerMonth } from "@/lib/pricing/deliveryInterval";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";

const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

export type RepriceResult =
  | {
      ok: true;
      frequency: FrequencyKey | "custom_interval";
      // Present iff frequency === "custom_interval" (Phase 10, research.md §5,
      // contracts/renewal-interval-advance.md).
      deliveryIntervalId?: string;
      deliveryIntervalDays?: number;
      deliveryIntervalDiscountPercent?: number;
      addressId: string;
      items: Array<{ productId: string; quantity: number }>;
      droppedProductIds: string[];
      breakdown: PriceBreakdown;
      pendingResolved: boolean;
    }
  | { ok: false; reason: "no_available_items" };

// Server-only, service-role (this runs from the cron route, which has no
// customer session at all — research.md/data-model.md). Resolves any due
// pending change (Phase 6's resolveEffectiveConfig, unchanged), drops any
// product deleted or made unavailable since the box was last chosen
// (FR-004), and calls the existing calculate() (Phase 3, unchanged) for
// the fresh breakdown — never the subscription's stale, snapshotted price
// (FR-002).
export async function repriceSubscriptionForRenewal(subscriptionId: string): Promise<RepriceResult> {
  const supabase = createServiceRoleClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "id, frequency, address_id, next_delivery_date, pending_frequency, pending_address_id, pending_price_breakdown, pending_effective_from, delivery_interval_id, delivery_interval_days, delivery_interval_last_discount_percent, pending_delivery_interval_id, pending_delivery_interval_days"
    )
    .eq("id", subscriptionId)
    .single();

  if (!subscription) {
    return { ok: false, reason: "no_available_items" };
  }

  const hasPendingChange = Boolean(subscription.pending_effective_from);

  const [{ data: items }, { data: pendingItems }] = await Promise.all([
    supabase.from("subscription_items").select("product_id, quantity").eq("subscription_id", subscriptionId),
    hasPendingChange
      ? supabase
          .from("subscription_pending_items")
          .select("product_id, quantity")
          .eq("subscription_id", subscriptionId)
      : Promise.resolve({ data: [] as { product_id: string; quantity: number }[] }),
  ]);

  const effective = resolveEffectiveConfig({
    now: new Date(),
    nextDeliveryDate: subscription.next_delivery_date,
    current: {
      frequency: subscription.frequency,
      deliveryIntervalId: subscription.delivery_interval_id,
      deliveryIntervalDays: subscription.delivery_interval_days,
      addressId: subscription.address_id,
      items: (items ?? []).map((row) => ({ productId: row.product_id, quantity: row.quantity })),
      priceBreakdown: null,
    },
    pending: hasPendingChange
      ? {
          frequency: subscription.pending_frequency,
          deliveryIntervalId: subscription.pending_delivery_interval_id,
          deliveryIntervalDays: subscription.pending_delivery_interval_days,
          addressId: subscription.pending_address_id,
          items: (pendingItems ?? []).map((row) => ({
            productId: row.product_id,
            quantity: row.quantity,
          })),
          priceBreakdown: subscription.pending_price_breakdown,
          effectiveFrom: subscription.pending_effective_from,
        }
      : null,
  });

  const pendingResolved = hasPendingChange && effective.pendingChange === null;

  const { data: address } = await supabase
    .from("addresses")
    .select("city_id, cities(delivery_fee_override)")
    .eq("id", effective.locked.addressId)
    .maybeSingle();

  const { data: settingsRow } = await supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single();

  if (!settingsRow || !address) {
    return { ok: false, reason: "no_available_items" };
  }

  const settings = mapSettingsRow(settingsRow);

  const productIds = effective.locked.items.map((item) => item.productId);
  const { data: products } =
    productIds.length > 0
      ? await supabase
          .from("products")
          .select("id, price, is_available")
          .in("id", productIds)
      : { data: [] };

  const productById = new Map((products ?? []).map((product) => [product.id, product]));

  // FR-004: drop any product deleted or made unavailable since the box was
  // last chosen — never crash the whole cycle over one discontinued item.
  const droppedProductIds: string[] = [];
  const survivingItems: Array<{ productId: string; quantity: number; price: number }> = [];

  for (const item of effective.locked.items) {
    const product = productById.get(item.productId);
    if (!product || !product.is_available) {
      droppedProductIds.push(item.productId);
      continue;
    }
    survivingItems.push({ productId: item.productId, quantity: item.quantity, price: Number(product.price) });
  }

  // FR-005: a box with nothing left available is a failure, not a
  // successful zero-value renewal.
  if (survivingItems.length === 0) {
    return { ok: false, reason: "no_available_items" };
  }

  const cityRow = Array.isArray(address.cities) ? address.cities[0] : address.cities;

  // Phase 10 (research.md §5): live discount when the interval is still
  // active; otherwise fall back to the subscription's own last-applied
  // snapshot (only meaningful when the locked interval is the subscription's
  // existing one, not a pending switch resolving into an interval that's
  // since been deactivated before ever taking effect — that edge case has
  // no established snapshot to fall back to, so it's treated as 0%).
  let deliveryInterval: { discountPercent: number; deliveriesPerMonth: number } | undefined;
  let deliveryIntervalDiscountPercent: number | undefined;

  if (effective.locked.frequency === "custom_interval") {
    const { data: interval } = await supabase
      .from("delivery_intervals")
      .select("discount_percent, is_active")
      .eq("id", effective.locked.deliveryIntervalId!)
      .maybeSingle();

    if (interval && interval.is_active) {
      deliveryIntervalDiscountPercent = Number(interval.discount_percent);
    } else if (subscription.delivery_interval_id === effective.locked.deliveryIntervalId) {
      deliveryIntervalDiscountPercent = Number(subscription.delivery_interval_last_discount_percent ?? 0);
    } else {
      deliveryIntervalDiscountPercent = 0;
    }

    deliveryInterval = {
      discountPercent: deliveryIntervalDiscountPercent,
      deliveriesPerMonth: estimateDeliveriesPerMonth(effective.locked.deliveryIntervalDays!),
    };
  }

  const breakdown = calculate({
    items: survivingItems,
    frequency: effective.locked.frequency,
    deliveryInterval,
    city: { id: address.city_id, deliveryFeeOverride: cityRow?.delivery_fee_override ?? null },
    settings,
  });

  return {
    ok: true,
    frequency: effective.locked.frequency,
    deliveryIntervalId:
      effective.locked.frequency === "custom_interval" ? effective.locked.deliveryIntervalId! : undefined,
    deliveryIntervalDays:
      effective.locked.frequency === "custom_interval" ? effective.locked.deliveryIntervalDays! : undefined,
    deliveryIntervalDiscountPercent,
    addressId: effective.locked.addressId,
    items: survivingItems.map(({ productId, quantity }) => ({ productId, quantity })),
    droppedProductIds,
    breakdown,
    pendingResolved,
  };
}

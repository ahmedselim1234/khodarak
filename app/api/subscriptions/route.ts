import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { subscriptionCreateSchema } from "@/lib/validation/subscription";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { calculate } from "@/lib/pricing/calculate";
import { estimateDeliveriesPerMonth } from "@/lib/pricing/deliveryInterval";
import { isDateSelectable } from "@/lib/subscription/selectableDeliveryDates";

const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

const CART_SELECT = "quantity, products(id, price, is_available)";

type CartItemRow = {
  quantity: number;
  products:
    | { id: string; price: number; is_available: boolean }
    | Array<{ id: string; price: number; is_available: boolean }>
    | null;
};

// POST /api/subscriptions — per contracts/subscriptions-api.md. The box is
// read server-side from the caller's own cart_items, never trusted from the
// request body (research.md §1). The price is always recomputed via
// calculate.ts at this exact moment — never accepted from the client
// (Constitution Principle II).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = subscriptionCreateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { deliveryIntervalId, addressId, nextDeliveryDate, deliveryTimeSlot } = result.data;

  const { data: settingsRow, error: settingsError } = await supabase
    .from("settings")
    .select(SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  if (settingsError || !settingsRow) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const settings = mapSettingsRow(settingsRow);

  // FR-005/FR-007: resolved and re-validated server-side — never trusted
  // from the client (Phase 10, contracts/subscription-interval-integration.md).
  const { data: interval } = await supabase
    .from("delivery_intervals")
    .select("id, days, discount_percent, is_active")
    .eq("id", deliveryIntervalId)
    .maybeSingle();

  if (!interval) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!interval.is_active) {
    return NextResponse.json({ error: "interval_unavailable" }, { status: 422 });
  }

  const intervalDiscountPercent = Number(interval.discount_percent);

  // FR-006: re-validated server-side — the picker already restricts this,
  // but "never a client-computed or stale" applies to validation too.
  if (
    !isDateSelectable(nextDeliveryDate, new Date(), {
      leadDays: settings.firstDeliveryLeadDays,
      blackoutWeekdays: settings.blackoutWeekdays,
    })
  ) {
    return NextResponse.json(
      { error: "validation_failed", fields: { nextDeliveryDate: "التاريخ غير متاح" } },
      { status: 400 }
    );
  }

  // Owner-checked address lookup — 404, never confirms existence of another
  // user's row (same non-enumeration posture as addresses-api.md).
  const { data: address } = await supabase
    .from("addresses")
    .select("id, city_id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!address) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: city } = await supabase
    .from("cities")
    .select("id, delivery_fee_override")
    .eq("id", address.city_id)
    .maybeSingle();

  if (!city) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // The box IS the cart (research.md §1) — never trusted from the request body.
  const { data: cartData } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", user.id);

  const resolvedItems = ((cartData ?? []) as CartItemRow[]).flatMap((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product || !product.is_available) return [];
    return [{ productId: product.id, price: Number(product.price), quantity: row.quantity }];
  });

  if (resolvedItems.length === 0) {
    return NextResponse.json({ error: "empty_box" }, { status: 400 });
  }

  const breakdown = calculate({
    items: resolvedItems,
    frequency: "custom_interval",
    deliveryInterval: {
      discountPercent: intervalDiscountPercent,
      deliveriesPerMonth: estimateDeliveriesPerMonth(interval.days),
    },
    city: { id: city.id, deliveryFeeOverride: city.delivery_fee_override },
    settings,
  });

  // FR-009: block on rule violations — the client already disables confirm
  // in this state, the server is the actual gate.
  if (!breakdown.meetsMinimumOrderValue || !breakdown.withinMaxItemsPerBox) {
    return NextResponse.json({ error: "rule_violation", breakdown }, { status: 422 });
  }

  // Phase 9 audit fix (AUDIT_FINDINGS.md F-002): creation writes go through
  // the service-role client, not the caller's own RLS-scoped session —
  // subscriptions/subscription_items have no authenticated-role INSERT
  // policy at all (20260811150000_close_subscription_insert_gap.sql),
  // mirroring the exact pattern Phase 5/6/7 already established for every
  // other financial write. The price/items above are still fully
  // server-computed moments earlier using the caller's own RLS-scoped
  // reads (settings/address/city/cart) — this only changes which client
  // performs the resulting write.
  const serviceRoleSupabase = createServiceRoleClient();

  const { data: subscription, error: subscriptionError } = await serviceRoleSupabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      address_id: addressId,
      frequency: "custom_interval",
      delivery_interval_id: interval.id,
      delivery_interval_days: interval.days,
      delivery_interval_last_discount_percent: intervalDiscountPercent,
      next_delivery_date: nextDeliveryDate,
      delivery_time_slot: deliveryTimeSlot,
      price_breakdown: breakdown,
    })
    .select("id")
    .single();

  if (subscriptionError || !subscription) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const { error: itemsError } = await serviceRoleSupabase.from("subscription_items").insert(
    resolvedItems.map((item) => ({
      subscription_id: subscription.id,
      product_id: item.productId,
      quantity: item.quantity,
    }))
  );

  if (itemsError) {
    // Compensating action (research.md §3) — never leave a subscription with
    // no items reachable.
    await serviceRoleSupabase.from("subscriptions").delete().eq("id", subscription.id);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // FR-012: only cleared once both inserts above have succeeded.
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ subscriptionId: subscription.id }, { status: 201 });
}

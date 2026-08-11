import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  selfHealOverduePause,
  applyImmediateEdit,
  savePendingEdit,
} from "@/lib/subscription/mutateSubscription";
import { resolveEffectiveConfig } from "@/lib/subscription/resolveEffectiveConfig";
import { subscriptionHealth } from "@/lib/subscription/subscriptionHealth";
import { consecutiveFailedPayments } from "@/lib/subscription/consecutiveFailedPayments";
import { subscriptionEditSchema } from "@/lib/validation/subscriptionEdit";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { calculate } from "@/lib/pricing/calculate";
import { selectableDeliveryDates } from "@/lib/subscription/selectableDeliveryDates";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

const FULL_SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

const SUBSCRIPTION_SELECT =
  "id, user_id, status, frequency, address_id, next_delivery_date, paused_until, price_breakdown, pending_frequency, pending_address_id, pending_price_breakdown, pending_effective_from";

const SETTINGS_SELECT = "edit_cutoff_hours";

// GET /api/subscriptions/[id] — per
// specs/007-phase-6-customer-dashboard/contracts/subscription-detail-and-edit-api.md.
// Owner-scoped: 404 for anything not found or not the caller's own
// (Constitution Principle V). Self-heals an overdue paused→active
// transition on read (data-model.md's state-transitions note, FR-013).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let { data: subscription } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (subscription.status === "paused") {
    await selfHealOverduePause(subscription.id);
    const { data: refreshed } = await supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_SELECT)
      .eq("id", id)
      .single();
    if (refreshed) subscription = refreshed;
  }

  const [{ data: items }, { data: pendingItems }, { data: settingsRow }, { data: recentPayments }] =
    await Promise.all([
      supabase
        .from("subscription_items")
        .select("product_id, quantity, products(name_ar, price)")
        .eq("subscription_id", subscription.id),
      supabase
        .from("subscription_pending_items")
        .select("product_id, quantity, products(name_ar, price)")
        .eq("subscription_id", subscription.id),
      supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single(),
      supabase
        .from("payments")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const editCutoffHours = settingsRow?.edit_cutoff_hours ?? 0;
  const now = new Date();
  const nextDelivery = new Date(`${subscription.next_delivery_date}T00:00:00Z`);
  const hoursUntilNextDelivery = (nextDelivery.getTime() - now.getTime()) / (1000 * 60 * 60);
  const insideEditCutoff = hoursUntilNextDelivery <= editCutoffHours;

  const hasPendingChange = Boolean(subscription.pending_effective_from);

  const effective = resolveEffectiveConfig({
    now,
    nextDeliveryDate: subscription.next_delivery_date,
    current: {
      frequency: subscription.frequency,
      addressId: subscription.address_id,
      items: mapItemRows(items ?? []),
      priceBreakdown: subscription.price_breakdown,
    },
    pending: hasPendingChange
      ? {
          frequency: subscription.pending_frequency,
          addressId: subscription.pending_address_id,
          items: mapItemRows(pendingItems ?? []),
          priceBreakdown: subscription.pending_price_breakdown,
          effectiveFrom: subscription.pending_effective_from,
        }
      : null,
  });

  const health = subscriptionHealth({
    status: subscription.status,
    consecutiveFailedPayments: consecutiveFailedPayments(recentPayments ?? []),
    hasPendingChangeInsideCutoff: hasPendingChange && insideEditCutoff,
  });

  return NextResponse.json({
    id: subscription.id,
    status: subscription.status,
    frequency: effective.locked.frequency,
    nextDeliveryDate: subscription.next_delivery_date,
    pausedUntil: subscription.paused_until,
    insideEditCutoff,
    items: mapItemRowsForResponse(subscription.status === "active" || subscription.status === "paused" ? items ?? [] : []),
    priceBreakdown: effective.locked.priceBreakdown as PriceBreakdown,
    addressId: effective.locked.addressId,
    pendingChange: effective.pendingChange
      ? {
          frequency: effective.pendingChange.frequency,
          addressId: effective.pendingChange.addressId,
          items: mapItemRowsForResponse(pendingItems ?? []),
          priceBreakdown: effective.pendingChange.priceBreakdown as PriceBreakdown,
          effectiveFrom: effective.pendingChange.effectiveFrom,
        }
      : null,
    health,
  });
}

// PATCH /api/subscriptions/[id] — per contracts/subscription-detail-and-edit-api.md.
// Full replace of items/frequency/address (US2). Re-prices server-side
// through the same calculate() used at subscription creation (Constitution
// Principle II) and applies cutoff/pending-change logic (FR-009).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = subscriptionEditSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const { items, frequency, addressId } = result.data;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, next_delivery_date, frequency")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (subscription.status !== "active") {
    return NextResponse.json(
      { error: "not_editable", status: subscription.status },
      { status: 409 }
    );
  }

  const { data: address } = await supabase
    .from("addresses")
    .select("city_id, cities(delivery_fee_override)")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!address) {
    return NextResponse.json(
      { error: "validation_failed", fields: { addressId: "العنوان غير صالح" } },
      { status: 400 }
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, price, is_available, min_qty, max_qty")
    .in(
      "id",
      items.map((item) => item.productId)
    );

  const productById = new Map((products ?? []).map((product) => [product.id, product]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || !product.is_available) {
      return NextResponse.json(
        { error: "product_unavailable", productId: item.productId },
        { status: 422 }
      );
    }
    if (item.quantity < product.min_qty || item.quantity > product.max_qty) {
      return NextResponse.json(
        { error: "rule_violated", rule: "product_quantity", productId: item.productId },
        { status: 422 }
      );
    }
  }

  const { data: settingsRow } = await supabase
    .from("settings")
    .select(FULL_SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  if (!settingsRow) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const settings = mapSettingsRow(settingsRow);

  if (!settings.frequencies[frequency]?.enabled) {
    return NextResponse.json(
      { error: "rule_violated", rule: "frequency_disabled" },
      { status: 422 }
    );
  }

  const cityRow = Array.isArray(address.cities) ? address.cities[0] : address.cities;

  const breakdown = calculate({
    items: items.map((item) => ({
      productId: item.productId,
      price: Number(productById.get(item.productId)!.price),
      quantity: item.quantity,
    })),
    frequency,
    city: { id: address.city_id, deliveryFeeOverride: cityRow?.delivery_fee_override ?? null },
    settings,
  });

  if (!breakdown.meetsMinimumOrderValue) {
    return NextResponse.json(
      { error: "rule_violated", rule: "min_order_value" },
      { status: 422 }
    );
  }
  if (!breakdown.withinMaxItemsPerBox) {
    return NextResponse.json(
      { error: "rule_violated", rule: "max_items_per_box" },
      { status: 422 }
    );
  }

  const now = new Date();
  const nextDelivery = new Date(`${subscription.next_delivery_date}T00:00:00Z`);
  const hoursUntilNextDelivery = (nextDelivery.getTime() - now.getTime()) / (1000 * 60 * 60);
  const insideEditCutoff = hoursUntilNextDelivery <= settings.editCutoffHours;

  if (insideEditCutoff) {
    const dates = selectableDeliveryDates(now, {
      leadDays: settings.firstDeliveryLeadDays,
      blackoutWeekdays: settings.blackoutWeekdays,
      horizonDays: settings.firstDeliveryLeadDays + 60,
    });
    const effectiveFrom = dates.find((date) => date > subscription.next_delivery_date) ?? dates[0];

    await savePendingEdit({
      subscriptionId: subscription.id,
      frequency,
      addressId,
      items,
      priceBreakdown: breakdown,
      effectiveFrom,
    });

    return NextResponse.json({
      applied: "pending",
      effectiveFrom,
      priceBreakdown: breakdown,
    });
  }

  let nextDeliveryDate = subscription.next_delivery_date;
  // Only a frequency change recalculates the next delivery date (FR-007) —
  // an item-only edit outside the cutoff leaves the already-scheduled date
  // untouched. Recalculated from today, respecting lead time/blackout days,
  // mirroring Phase 4's own first-delivery-date selection logic.
  if (frequency !== subscription.frequency) {
    const dates = selectableDeliveryDates(now, {
      leadDays: settings.firstDeliveryLeadDays,
      blackoutWeekdays: settings.blackoutWeekdays,
      horizonDays: settings.firstDeliveryLeadDays + 14,
    });
    if (dates.length > 0) {
      nextDeliveryDate = dates[0];
    }
  }

  await applyImmediateEdit({
    subscriptionId: subscription.id,
    frequency,
    addressId,
    items,
    priceBreakdown: breakdown,
    nextDeliveryDate,
  });

  return NextResponse.json({
    applied: "immediately",
    priceBreakdown: breakdown,
    nextDeliveryDate,
  });
}

type ItemRow = {
  product_id: string;
  quantity: number;
  products: { name_ar: string; price: number } | { name_ar: string; price: number }[] | null;
};

function mapItemRows(rows: ItemRow[]) {
  return rows.map((row) => ({ productId: row.product_id, quantity: row.quantity }));
}

function mapItemRowsForResponse(rows: ItemRow[]) {
  return rows.map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      productId: row.product_id,
      productNameAr: product?.name_ar ?? "",
      quantity: row.quantity,
      unitPrice: product ? Number(product.price) : 0,
    };
  });
}

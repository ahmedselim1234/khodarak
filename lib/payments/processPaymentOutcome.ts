import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { shouldBeDefaultPaymentMethod } from "./paymentOutcomeDecisions";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

type VerifiedStatus = "paid" | "failed";

// THE shared, idempotent activation/failure function — called by both
// GET /api/payments/callback and POST /api/webhooks/moyasar
// (contracts/payment-outcome-processing.md). `verifiedStatus` MUST already
// be the result of an authoritative check performed by the caller; this
// function does not itself call Moyasar.
export async function processPaymentOutcome(
  moyasarPaymentId: string,
  verifiedStatus: VerifiedStatus,
  rawResponse: unknown
): Promise<void> {
  const supabase = createServiceRoleClient();

  // Step 1 — the entire idempotency guarantee (research.md §3): only a
  // still-'initiated' row is resolved here. A second/concurrent/redelivered
  // call for an already-terminal payment updates zero rows and returns.
  const { data: updatedPayments, error: updateError } = await supabase
    .from("payments")
    .update({ status: verifiedStatus, raw_response: rawResponse })
    .eq("moyasar_payment_id", moyasarPaymentId)
    .in("status", ["initiated"])
    .select("id, subscription_id, user_id, amount_halalas");

  if (updateError) {
    throw new Error(`processPaymentOutcome: failed to update payments row: ${updateError.message}`);
  }

  const payment = updatedPayments?.[0];
  if (!payment) {
    // Already processed by an earlier call, or no matching payment at all.
    return;
  }

  if (verifiedStatus === "failed") {
    // FR-016: subscription stays pending_payment; nothing else to do.
    return;
  }

  if (!payment.subscription_id) {
    return;
  }

  // Step 3 — activation.
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, user_id, address_id, next_delivery_date, price_breakdown")
    .eq("id", payment.subscription_id)
    .maybeSingle();

  if (!subscription) return;

  const { data: subscriptionItems } = await supabase
    .from("subscription_items")
    .select("product_id, quantity")
    .eq("subscription_id", subscription.id);

  const { data: address } = await supabase
    .from("addresses")
    .select("label, city_id, district, street_details, cities(name_ar)")
    .eq("id", subscription.address_id)
    .maybeSingle();

  // 3b — upsert payment_methods.
  const tokenId = extractTokenId(rawResponse);
  if (tokenId) {
    const { data: existingMethod } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("moyasar_token_id", tokenId)
      .maybeSingle();

    if (!existingMethod) {
      const { count: existingActiveCount } = await supabase
        .from("payment_methods")
        .select("id", { count: "exact", head: true })
        .eq("user_id", payment.user_id)
        .eq("status", "active");

      const cardDetails = extractCardDetails(rawResponse);
      if (cardDetails) {
        await supabase.from("payment_methods").insert({
          user_id: payment.user_id,
          moyasar_token_id: tokenId,
          brand: cardDetails.brand,
          last_four: cardDetails.lastFour,
          exp_month: cardDetails.expMonth,
          exp_year: cardDetails.expYear,
          is_default: shouldBeDefaultPaymentMethod(existingActiveCount ?? 0),
        });
      }
    }
  }

  // 3c — activate the subscription.
  await supabase
    .from("subscriptions")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("id", subscription.id);

  // 3d — generate the order from the subscription's own snapshot (FR-009).
  const addressRow = Array.isArray(address) ? address[0] : address;
  const cityName = addressRow
    ? Array.isArray(addressRow.cities)
      ? addressRow.cities[0]?.name_ar
      : (addressRow.cities as { name_ar: string } | null)?.name_ar
    : undefined;

  const { data: order } = await supabase
    .from("orders")
    .insert({
      subscription_id: subscription.id,
      user_id: payment.user_id,
      address_snapshot: addressRow
        ? {
            label: addressRow.label,
            cityName: cityName ?? null,
            district: addressRow.district,
            streetDetails: addressRow.street_details,
          }
        : {},
      status: "pending",
      scheduled_date: subscription.next_delivery_date,
      price_breakdown: subscription.price_breakdown as PriceBreakdown,
    })
    .select("id")
    .single();

  if (order && subscriptionItems && subscriptionItems.length > 0) {
    const productIds = subscriptionItems.map((item) => item.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name_ar, price")
      .in("id", productIds);

    const productById = new Map((products ?? []).map((product) => [product.id, product]));

    const orderItemRows = subscriptionItems.flatMap((item) => {
      const product = productById.get(item.product_id);
      if (!product) return [];
      return [
        {
          order_id: order.id,
          product_id: item.product_id,
          product_name_snapshot: product.name_ar,
          unit_price_snapshot: product.price,
          quantity: item.quantity,
        },
      ];
    });

    if (orderItemRows.length > 0) {
      await supabase.from("order_items").insert(orderItemRows);
    }

    // 3f — link the payment to its resulting order.
    await supabase.from("payments").update({ order_id: order.id }).eq("id", payment.id);
  }
}

function extractTokenId(rawResponse: unknown): string | null {
  if (typeof rawResponse !== "object" || rawResponse === null) return null;
  const source = (rawResponse as { source?: { token?: string } }).source;
  return source?.token ?? null;
}

function extractCardDetails(
  rawResponse: unknown
): { brand: string; lastFour: string; expMonth: number; expYear: number } | null {
  if (typeof rawResponse !== "object" || rawResponse === null) return null;
  const source = (
    rawResponse as {
      source?: {
        company?: string;
        name?: string;
        number?: string;
        month?: string | number;
        year?: string | number;
      };
    }
  ).source;
  if (!source?.number) return null;

  const lastFour = source.number.slice(-4);
  // NOTE: verify `source.month`/`source.year` against Moyasar's current API
  // docs before relying on this in a live environment — field names here
  // follow Moyasar's commonly documented card-source shape as of this
  // phase's design, but weren't confirmed against a live test response in
  // this sandbox. Falls back to a far-future placeholder rather than
  // failing the whole activation over a display-only field if absent.
  const expMonth = Number(source.month) || 12;
  const expYear = Number(source.year) || new Date().getFullYear() + 3;

  return {
    brand: source.company ?? "unknown",
    lastFour,
    expMonth,
    expYear,
  };
}

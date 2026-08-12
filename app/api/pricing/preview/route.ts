import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pricingPreviewRequestSchema } from "@/lib/validation/pricingPreview";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { calculate, type CalculateInput } from "@/lib/pricing/calculate";
import { estimateDeliveriesPerMonth } from "@/lib/pricing/deliveryInterval";
import { FULL_SETTINGS_SELECT } from "@/lib/pricing/settingsSelect";

// POST /api/pricing/preview — per contracts/pricing-preview-api.md. No
// authentication required (FR-017a) — this is the one Route Handler in the
// project with no session check at all. Never accepts a price/breakdown
// value from the request body; every number in the response is freshly
// computed from current products/settings (Constitution Principle II).
export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json().catch(() => null);
  const result = pricingPreviewRequestSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { items, frequency, deliveryIntervalId, cityId } = result.data;

  const { data: settingsRow, error: settingsError } = await supabase
    .from("settings")
    .select(FULL_SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  if (settingsError || !settingsRow) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const settings = mapSettingsRow(settingsRow);

  let calculateFrequencyInput: CalculateInput["frequency"];
  let deliveryInterval: CalculateInput["deliveryInterval"];

  if (deliveryIntervalId) {
    // Phase 10: contracts/subscription-interval-integration.md.
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

    calculateFrequencyInput = "custom_interval";
    deliveryInterval = {
      discountPercent: Number(interval.discount_percent),
      deliveriesPerMonth: estimateDeliveriesPerMonth(interval.days),
    };
  } else {
    // FR-012: a disabled frequency can't be calculated against.
    if (!settings.frequencies[frequency!]?.enabled) {
      return NextResponse.json({ error: "frequency_disabled" }, { status: 422 });
    }
    calculateFrequencyInput = frequency!;
  }

  const { data: city } = await supabase
    .from("cities")
    .select("id, delivery_fee_override")
    .eq("id", cityId)
    .maybeSingle();

  if (!city) {
    return NextResponse.json(
      { error: "validation_failed", fields: { cityId: "المدينة غير موجودة" } },
      { status: 400 }
    );
  }

  const droppedItems: string[] = [];
  let resolvedItems: Array<{ productId: string; price: number; quantity: number }> = [];

  if (items.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, price, is_available")
      .in(
        "id",
        items.map((item) => item.productId)
      );

    const productById = new Map((products ?? []).map((product) => [product.id, product]));

    resolvedItems = items.flatMap((item) => {
      const product = productById.get(item.productId);
      // FR-019: excluded and flagged, not a failed request.
      if (!product || !product.is_available) {
        droppedItems.push(item.productId);
        return [];
      }
      return [{ productId: product.id, price: Number(product.price), quantity: item.quantity }];
    });
  }

  const breakdown = calculate({
    items: resolvedItems,
    frequency: calculateFrequencyInput,
    deliveryInterval,
    city: { id: city.id, deliveryFeeOverride: city.delivery_fee_override },
    settings,
  });

  return NextResponse.json({ breakdown: { ...breakdown, droppedItems } });
}

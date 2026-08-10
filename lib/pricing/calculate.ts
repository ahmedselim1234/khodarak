import type { FrequencyKey, MappedSettings } from "./mapSettingsRow";

export type CalculateInput = {
  items: Array<{ productId: string; price: number; quantity: number }>;
  frequency: FrequencyKey;
  city: { id: string; deliveryFeeOverride: number | null };
  settings: MappedSettings;
};

export type PriceBreakdown = {
  itemsSubtotal: number;
  droppedItems: string[];
  frequencyDiscountAmount: number;
  afterDiscount: number;
  deliveryFee: number;
  taxableBase: number;
  vatAmount: number;
  totalPerDelivery: number;
  estimatedMonthly: number;
  meetsMinimumOrderValue: boolean;
  withinMaxItemsPerBox: boolean;
};

// Rounds to `decimals` places via scale-round-unscale, avoiding the
// direct-float-comparison pitfalls at exactly the boundaries
// tests/unit/pricing.calculate.test.ts targets (research.md §4).
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function applyRounding(value: number, mode: MappedSettings["roundingMode"]): number {
  switch (mode) {
    case "nearest_0.5":
      return Math.round(value * 2) / 2;
    case "nearest_1":
      return Math.round(value);
    case "none":
    default:
      return roundTo(value, 2);
  }
}

// THE pricing engine (plan.md §3's single implementation, server-side).
// Pure function, no I/O — every value it needs is passed in already
// resolved by the caller (contracts/pricing-calculation.md). Runs the
// documented calculation order exactly; never reordered.
export function calculate(input: CalculateInput): PriceBreakdown {
  const { items, frequency, city, settings } = input;

  const itemsSubtotal = roundTo(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    2
  );

  const frequencyRule = settings.frequencies[frequency];
  const discountPercent = frequencyRule?.enabled ? frequencyRule.discountPercent : 0;
  const frequencyDiscountAmount = roundTo(itemsSubtotal * (discountPercent / 100), 2);
  const afterDiscount = roundTo(itemsSubtotal - frequencyDiscountAmount, 2);

  let deliveryFee: number;
  if (settings.deliveryMode === "free_above_threshold") {
    deliveryFee = afterDiscount >= settings.deliveryFreeThreshold ? 0 : settings.deliveryFlatFee;
  } else if (settings.deliveryMode === "per_city") {
    deliveryFee = city.deliveryFeeOverride ?? settings.deliveryFlatFee;
  } else {
    deliveryFee = settings.deliveryFlatFee;
  }
  deliveryFee = roundTo(deliveryFee, 2);

  const taxableBase = roundTo(afterDiscount + deliveryFee, 2);

  let vatAmount: number;
  let preRoundingTotal: number;
  if (settings.pricesIncludeVat) {
    // VAT is embedded in taxableBase already — extract it rather than
    // adding it on top.
    vatAmount = roundTo(taxableBase - taxableBase / (1 + settings.vatPercent / 100), 2);
    preRoundingTotal = taxableBase;
  } else {
    vatAmount = roundTo(taxableBase * (settings.vatPercent / 100), 2);
    preRoundingTotal = roundTo(taxableBase + vatAmount, 2);
  }

  const totalPerDelivery = applyRounding(preRoundingTotal, settings.roundingMode);
  const deliveriesPerMonth = frequencyRule?.deliveriesPerMonth ?? 0;
  const estimatedMonthly = roundTo(totalPerDelivery * deliveriesPerMonth, 2);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    itemsSubtotal,
    droppedItems: [],
    frequencyDiscountAmount,
    afterDiscount,
    deliveryFee,
    taxableBase,
    vatAmount,
    totalPerDelivery,
    estimatedMonthly,
    meetsMinimumOrderValue: itemsSubtotal >= settings.minOrderValue,
    withinMaxItemsPerBox: totalQuantity <= settings.maxItemsPerBox,
  };
}

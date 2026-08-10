export type FrequencyKey = "weekly" | "biweekly" | "monthly";

export type FrequencyRule = {
  enabled: boolean;
  discountPercent: number;
  deliveriesPerMonth: number;
};

export type Frequencies = Record<FrequencyKey, FrequencyRule>;

export type DeliveryMode = "flat" | "free_above_threshold" | "per_city";
export type RoundingMode = "none" | "nearest_0.5" | "nearest_1";

type SettingsRow = {
  frequencies: Frequencies;
  min_order_value: number;
  max_items_per_box: number;
  edit_cutoff_hours: number;
  first_delivery_lead_days: number;
  blackout_weekdays: number[];
  delivery_mode: DeliveryMode;
  delivery_flat_fee: number;
  delivery_free_threshold: number;
  max_pause_days: number;
  max_pauses_per_year: number;
  vat_percent: number;
  prices_include_vat: boolean;
  rounding_mode: RoundingMode;
  updated_at: string;
};

// Maps a Supabase `settings` row (snake_case) to the camelCase shape used
// throughout the app and documented in contracts/settings-admin-api.md.
export function mapSettingsRow(row: SettingsRow) {
  return {
    frequencies: row.frequencies,
    minOrderValue: Number(row.min_order_value),
    maxItemsPerBox: row.max_items_per_box,
    editCutoffHours: row.edit_cutoff_hours,
    firstDeliveryLeadDays: row.first_delivery_lead_days,
    blackoutWeekdays: row.blackout_weekdays,
    deliveryMode: row.delivery_mode,
    deliveryFlatFee: Number(row.delivery_flat_fee),
    deliveryFreeThreshold: Number(row.delivery_free_threshold),
    maxPauseDays: row.max_pause_days,
    maxPausesPerYear: row.max_pauses_per_year,
    vatPercent: Number(row.vat_percent),
    pricesIncludeVat: row.prices_include_vat,
    roundingMode: row.rounding_mode,
    updatedAt: row.updated_at,
  };
}

export type MappedSettings = ReturnType<typeof mapSettingsRow>;

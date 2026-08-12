// Named, shared `settings` column-select strings — extracted from 9
// independently-redeclared local copies (Phase 11, research.md §1.4). The
// full projection is used everywhere the whole settings row is needed
// (pricing calculation, the settings admin screen); the narrower ones match
// exactly what pause/resume already only ever needed, kept separate rather
// than over-fetching.
export const FULL_SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

export const EDIT_CUTOFF_SETTINGS_SELECT = "edit_cutoff_hours";

export const PAUSE_SETTINGS_SELECT = "max_pause_days, max_pauses_per_year";

export const RESUME_SETTINGS_SELECT = "first_delivery_lead_days, blackout_weekdays";

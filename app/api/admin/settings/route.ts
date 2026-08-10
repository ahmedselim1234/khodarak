import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { settingsUpdateSchema } from "@/lib/validation/settings";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";

const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

// GET /api/admin/settings — per contracts/settings-admin-api.md.
export async function GET() {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const { data, error } = await supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ settings: mapSettingsRow(data) });
}

// PATCH /api/admin/settings — per contracts/settings-admin-api.md. A partial
// `frequencies` update replaces only the named frequency key(s); omitted
// keys keep their previously saved values.
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = settingsUpdateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const {
    frequencies,
    minOrderValue,
    maxItemsPerBox,
    editCutoffHours,
    firstDeliveryLeadDays,
    blackoutWeekdays,
    deliveryMode,
    deliveryFlatFee,
    deliveryFreeThreshold,
    maxPauseDays,
    maxPausesPerYear,
    vatPercent,
    pricesIncludeVat,
    roundingMode,
  } = result.data;

  let frequenciesUpdate: Record<string, unknown> | undefined;
  if (frequencies) {
    const { data: current } = await supabase
      .from("settings")
      .select("frequencies")
      .eq("id", 1)
      .single();

    frequenciesUpdate = { ...(current?.frequencies ?? {}), ...frequencies };
  }

  const { data, error } = await supabase
    .from("settings")
    .update({
      ...(frequenciesUpdate !== undefined && { frequencies: frequenciesUpdate }),
      ...(minOrderValue !== undefined && { min_order_value: minOrderValue }),
      ...(maxItemsPerBox !== undefined && { max_items_per_box: maxItemsPerBox }),
      ...(editCutoffHours !== undefined && { edit_cutoff_hours: editCutoffHours }),
      ...(firstDeliveryLeadDays !== undefined && { first_delivery_lead_days: firstDeliveryLeadDays }),
      ...(blackoutWeekdays !== undefined && { blackout_weekdays: blackoutWeekdays }),
      ...(deliveryMode !== undefined && { delivery_mode: deliveryMode }),
      ...(deliveryFlatFee !== undefined && { delivery_flat_fee: deliveryFlatFee }),
      ...(deliveryFreeThreshold !== undefined && { delivery_free_threshold: deliveryFreeThreshold }),
      ...(maxPauseDays !== undefined && { max_pause_days: maxPauseDays }),
      ...(maxPausesPerYear !== undefined && { max_pauses_per_year: maxPausesPerYear }),
      ...(vatPercent !== undefined && { vat_percent: vatPercent }),
      ...(pricesIncludeVat !== undefined && { prices_include_vat: pricesIncludeVat }),
      ...(roundingMode !== undefined && { rounding_mode: roundingMode }),
    })
    .eq("id", 1)
    .select(SETTINGS_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ settings: mapSettingsRow(data) });
}

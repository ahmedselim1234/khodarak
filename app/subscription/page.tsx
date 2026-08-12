import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { SubscriptionWizard } from "@/components/subscription/SubscriptionWizard";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";
const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

// /subscription — replaces the Phase 0 placeholder. Server Component:
// fetches available products, settings.frequencies/order-rules, and a
// default city for the build step's live preview (research.md §4); renders
// SubscriptionWizard, which owns the cart (the box, Phase 2) and pricing
// (Phase 3) client-side from here. Route protection unchanged from Phase 1
// (middleware.ts already gates /subscription for customer/admin).
export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, { data: settingsRow }, { data: defaultAddress }, { data: firstCity }] =
    await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("is_available", true).order("sort_order"),
      supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single(),
      user
        ? supabase
            .from("addresses")
            .select("city_id")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("cities").select("id").eq("is_active", true).order("name_ar").limit(1).maybeSingle(),
    ]);

  const mappedProducts = (products ?? []).map((row) => mapProductRow(row));
  const settings = settingsRow ? mapSettingsRow(settingsRow) : null;
  const defaultCityId = defaultAddress?.city_id ?? firstCity?.id ?? null;

  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary text-center mb-stack-lg">
              بناء الاشتراك
            </h1>
            {!settings ? (
              <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
                الإعدادات غير متاحة حالياً — الرجاء المحاولة لاحقاً.
              </p>
            ) : (
              <SubscriptionWizard
                products={mappedProducts}
                defaultCityId={defaultCityId}
                firstDeliveryLeadDays={settings.firstDeliveryLeadDays}
                blackoutWeekdays={settings.blackoutWeekdays}
              />
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

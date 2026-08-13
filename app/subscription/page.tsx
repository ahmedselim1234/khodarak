import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { SubscriptionWizard } from "@/components/subscription/SubscriptionWizard";
import { FULL_SETTINGS_SELECT } from "@/lib/pricing/settingsSelect";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";
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

  const [{ data: products }, { data: settingsRow }, { data: defaultAddress }, { data: cityRows }] =
    await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("is_available", true).order("sort_order"),
      supabase.from("settings").select(FULL_SETTINGS_SELECT).eq("id", 1).single(),
      user
        ? supabase
            .from("addresses")
            .select("city_id")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      // Full list, not just the first row: the checkout step now creates
      // addresses in place (AddressSelector -> AddressForm), which needs the
      // city options. Also serves the default-city fallback below, so this
      // replaces the old .limit(1) query rather than adding to it.
      supabase.from("cities").select("id, name_ar").eq("is_active", true).order("name_ar"),
    ]);

  const mappedProducts = (products ?? []).map((row) => mapProductRow(row));
  const settings = settingsRow ? mapSettingsRow(settingsRow) : null;
  const cities = (cityRows ?? []).map((row) => ({ id: row.id, nameAr: row.name_ar }));
  const defaultCityId = defaultAddress?.city_id ?? cities[0]?.id ?? null;

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
                cities={cities}
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

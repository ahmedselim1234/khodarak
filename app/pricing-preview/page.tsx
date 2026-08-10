import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { PreviewForm } from "@/components/pricing/PreviewForm";
import type { Frequencies } from "@/lib/pricing/mapSettingsRow";

const NO_FREQUENCIES_AVAILABLE: Frequencies = {
  weekly: { enabled: false, discountPercent: 0, deliveriesPerMonth: 0 },
  biweekly: { enabled: false, discountPercent: 0, deliveriesPerMonth: 0 },
  monthly: { enabled: false, discountPercent: 0, deliveriesPerMonth: 0 },
};

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

// /pricing-preview — NEW top-level, PUBLIC route (not under /subscription —
// Clarifications 2026-08-10). Server Component fetching sample products,
// active cities, and enabled frequencies; renders the "use client" PreviewForm.
export default async function PricingPreviewPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: cities }, { data: settingsRow }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .limit(8),
    supabase.from("cities").select("id, name_ar").eq("is_active", true).order("name_ar"),
    supabase.from("settings").select("frequencies").eq("id", 1).single(),
  ]);

  const sampleProducts = (products ?? []).map((row) => {
    const mapped = mapProductRow(row);
    return { id: mapped.id, nameAr: mapped.nameAr, price: mapped.price, unit: mapped.unit };
  });
  const cityOptions = (cities ?? []).map((city) => ({ id: city.id, nameAr: city.name_ar }));

  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg flex flex-col gap-stack-md">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
                معاينة السعر
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant text-right">
                اختر منتجات وترددًا لمشاهدة تفاصيل السعر مباشرة — بدون تسجيل الدخول.
              </p>
            </div>
            {sampleProducts.length === 0 || cityOptions.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
                لا توجد بيانات كافية للمعاينة بعد.
              </p>
            ) : (
              <PreviewForm
                products={sampleProducts}
                cities={cityOptions}
                frequencies={settingsRow?.frequencies ?? NO_FREQUENCIES_AVAILABLE}
              />
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

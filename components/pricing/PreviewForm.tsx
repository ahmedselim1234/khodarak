"use client";

import { useEffect, useRef, useState } from "react";
import { useLazyPreviewPriceQuery } from "@/lib/store/pricingApi";
import type { FrequencyKey, Frequencies } from "@/lib/pricing/mapSettingsRow";
import { PriceBreakdownCard } from "./PriceBreakdownCard";

const FREQUENCY_LABELS: Record<FrequencyKey, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

type SampleProduct = { id: string; nameAr: string; price: number; unit: string };
type City = { id: string; nameAr: string };

const DEBOUNCE_MS = 300;

// "use client" leaf — product/quantity/frequency/city selection; calls
// pricingApi's previewPrice on every change (debounced). Never computes a
// price itself (research.md §3, Constitution Principle II).
export function PreviewForm({
  products,
  cities,
  frequencies,
}: {
  products: SampleProduct[];
  cities: City[];
  frequencies: Frequencies;
}) {
  const enabledFrequencies = (Object.keys(frequencies) as FrequencyKey[]).filter(
    (key) => frequencies[key].enabled
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [frequency, setFrequency] = useState<FrequencyKey | null>(enabledFrequencies[0] ?? null);
  const [cityId, setCityId] = useState<string>(cities[0]?.id ?? "");
  const [triggerPreview, { data, isFetching }] = useLazyPreviewPriceQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedItems = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => ({ productId, quantity }));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // FR-020: an empty selection shows the zero state, no request needed.
    if (selectedItems.length === 0 || !frequency || !cityId) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      triggerPreview({ items: selectedItems, frequency, cityId });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedItems is derived fresh each render from `quantities`; comparing its serialized form would be equivalent noise.
  }, [JSON.stringify(quantities), frequency, cityId]);

  function setQuantity(productId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [productId]: Math.max(0, quantity) }));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <div className="flex flex-col gap-stack-md">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">المنتجات</h3>
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between bg-surface rounded-2xl p-3 border border-outline-variant/20"
            >
              <div>
                <p className="font-bold">{product.nameAr}</p>
                <p className="font-label-sm text-label-sm text-outline">
                  {product.price.toFixed(2)} ر.س / {product.unit}
                </p>
              </div>
              <input
                type="number"
                min={0}
                value={quantities[product.id] ?? 0}
                onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                className="w-16 bg-surface-container-low border border-outline-variant/30 rounded-xl p-2 text-center"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">التردد</h3>
          {enabledFrequencies.length === 0 ? (
            <p className="font-label-sm text-label-sm text-error">
              لا يوجد تردد توصيل متاح حالياً
            </p>
          ) : (
            <select
              value={frequency ?? ""}
              onChange={(e) => setFrequency(e.target.value as FrequencyKey)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
            >
              {enabledFrequencies.map((key) => (
                <option key={key} value={key}>
                  {FREQUENCY_LABELS[key]}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">المدينة</h3>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {selectedItems.length === 0 ? (
          <div className="bg-surface rounded-[20px] p-stack-md shadow-sm border border-outline-variant/30 text-center text-on-surface-variant">
            اختر منتجات لعرض السعر
          </div>
        ) : isFetching && !data ? (
          <div className="bg-surface rounded-[20px] p-stack-md shadow-sm border border-outline-variant/30 text-center text-on-surface-variant">
            جارٍ الحساب...
          </div>
        ) : data ? (
          <PriceBreakdownCard breakdown={data.breakdown} />
        ) : null}
      </div>
    </div>
  );
}

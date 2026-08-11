"use client";

import { useEffect, useRef, useState } from "react";
import type { MappedProduct } from "@/lib/products/mapProductRow";
import type { Frequencies, FrequencyKey } from "@/lib/pricing/mapSettingsRow";
import type { SubscriptionItem } from "@/lib/store/dashboardApi";
import { useEditSubscriptionMutation } from "@/lib/store/dashboardApi";
import { useLazyPreviewPriceQuery } from "@/lib/store/pricingApi";
import { useListAddressesQuery } from "@/lib/store/addressesApi";
import { clampQuantity } from "@/lib/cart/clampQuantity";
import { FrequencySelector } from "@/components/subscription/FrequencySelector";
import { AddressSelector } from "@/components/subscription/AddressSelector";
import { PriceBreakdownCard } from "@/components/pricing/PriceBreakdownCard";

const DEBOUNCE_MS = 300;
const UNIT_ERROR_MESSAGES: Record<string, string> = {
  min_order_value: "الطلب أقل من الحد الأدنى لقيمة الطلب",
  max_items_per_box: "عدد الأصناف يتجاوز الحد الأقصى للصندوق",
  product_quantity: "الكمية المطلوبة لأحد المنتجات غير صالحة",
  frequency_disabled: "التردد المختار غير متاح حالياً",
};

// "use client" — item/quantity/frequency/address editor (US2). Local state
// only, deliberately separate from the shopping-cart Redux slice (editing
// an existing subscription's box must never touch the customer's unrelated
// future cart). Calls /api/pricing/preview live (Phase 3, unchanged) before
// submit, then PATCH /api/subscriptions/[id] on save.
export function SubscriptionEditor({
  subscriptionId,
  products,
  frequencies,
  initialItems,
  initialFrequency,
  initialAddressId,
  onClose,
}: {
  subscriptionId: string;
  products: MappedProduct[];
  frequencies: Frequencies;
  initialItems: SubscriptionItem[];
  initialFrequency: FrequencyKey;
  initialAddressId: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Record<string, number>>(
    Object.fromEntries(initialItems.map((item) => [item.productId, item.quantity]))
  );
  const [frequency, setFrequency] = useState<FrequencyKey>(initialFrequency);
  const [addressId, setAddressId] = useState(initialAddressId);
  const [addingProductId, setAddingProductId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: addresses } = useListAddressesQuery();
  const [triggerPreview, { data: previewData, isFetching: previewLoading }] =
    useLazyPreviewPriceQuery();
  const [editSubscription, { isLoading: saving }] = useEditSubscriptionMutation();

  const cityId = addresses?.find((address) => address.id === addressId)?.cityId ?? null;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const entries = Object.entries(items).filter(([, quantity]) => quantity > 0);
    if (entries.length === 0 || !cityId) return;

    debounceRef.current = setTimeout(() => {
      triggerPreview({
        items: entries.map(([productId, quantity]) => ({ productId, quantity })),
        frequency,
        cityId,
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsKey is a stable serialization used to detect content changes only.
  }, [itemsKey, frequency, cityId]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const selectedEntries = Object.entries(items).filter(([, quantity]) => quantity > 0);
  const addableProducts = products.filter((product) => !items[product.id] && product.isAvailable);
  const breakdown = previewData?.breakdown;

  function setQuantity(productId: string, quantity: number) {
    const product = productById.get(productId);
    if (!product) return;
    const clamped = clampQuantity(quantity, { minQty: product.minQty, maxQty: product.maxQty });
    setItems((prev) => {
      const next = { ...prev };
      if (clamped === 0) {
        delete next[productId];
      } else {
        next[productId] = clamped;
      }
      return next;
    });
  }

  async function handleSave() {
    if (!addressId || selectedEntries.length === 0) return;
    setError(null);

    try {
      const response = await editSubscription({
        id: subscriptionId,
        body: {
          items: selectedEntries.map(([productId, quantity]) => ({ productId, quantity })),
          frequency,
          addressId,
        },
      }).unwrap();

      if (response.applied === "pending") {
        setError(null);
      }
      onClose();
    } catch (err) {
      const data = (err as { data?: { error?: string; rule?: string; productId?: string } })?.data;
      if (data?.error === "rule_violated" && data.rule) {
        setError(UNIT_ERROR_MESSAGES[data.rule] ?? "تعذر حفظ التعديل");
      } else if (data?.error === "product_unavailable") {
        setError("أحد المنتجات المختارة لم يعد متوفراً");
      } else if (data?.error === "not_editable") {
        setError("لا يمكن تعديل هذا الاشتراك في حالته الحالية");
      } else {
        setError("تعذر حفظ التعديل — الرجاء المحاولة مرة أخرى");
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md overflow-y-auto">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-3xl w-full flex flex-col gap-stack-md my-stack-lg">
        <h3 className="font-headline-md text-headline-md font-bold">تعديل الصندوق</h3>

        <div className="flex flex-col gap-2">
          <h4 className="font-bold">المنتجات الحالية</h4>
          {selectedEntries.length === 0 && (
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              لم يتم اختيار أي منتج
            </p>
          )}
          {selectedEntries.map(([productId, quantity]) => {
            const product = productById.get(productId);
            if (!product) return null;
            return (
              <div
                key={productId}
                className="flex items-center justify-between border border-outline-variant/30 rounded-xl px-4 py-2"
              >
                <span>{product.nameAr}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(productId, quantity - 1)}
                    className="w-8 h-8 rounded-full hover:bg-surface-container-high"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(productId, quantity + 1)}
                    className="w-8 h-8 rounded-full hover:bg-surface-container-high"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(productId, 0)}
                    aria-label="إزالة"
                    className="text-error ms-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {addableProducts.length > 0 && (
          <div className="flex gap-2 items-center">
            <select
              value={addingProductId}
              onChange={(e) => setAddingProductId(e.target.value)}
              className="border border-outline-variant rounded-xl px-3 py-2 flex-1"
            >
              <option value="">إضافة منتج...</option>
              {addableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nameAr}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!addingProductId}
              onClick={() => {
                const product = productById.get(addingProductId);
                if (product) setQuantity(addingProductId, product.minQty);
                setAddingProductId("");
              }}
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold disabled:opacity-50"
            >
              إضافة
            </button>
          </div>
        )}

        <FrequencySelector frequencies={frequencies} value={frequency} onChange={setFrequency} />
        <AddressSelector value={addressId} onChange={setAddressId} />

        {previewLoading || !breakdown ? (
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {previewLoading ? "جارٍ الحساب..." : "أضف منتجات لعرض السعر"}
          </p>
        ) : (
          <PriceBreakdownCard breakdown={breakdown} />
        )}

        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}

        <div className="flex gap-stack-sm justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-full border-2 border-outline-variant font-bold"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedEntries.length === 0 || !addressId}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التعديل"}
          </button>
        </div>
      </div>
    </div>
  );
}

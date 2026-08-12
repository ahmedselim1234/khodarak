"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/lib/store/cartApi";
import { useListAddressesQuery } from "@/lib/store/addressesApi";
import { useLazyPreviewPriceQuery } from "@/lib/store/pricingApi";
import { useCreateSubscriptionMutation } from "@/lib/store/subscriptionsApi";
import type { MappedProduct, ProductCategory } from "@/lib/products/mapProductRow";
import type { TimeSlotId } from "@/lib/subscription/timeSlots";
import { WizardProgressHeader } from "./WizardProgressHeader";
import { BoxCategoryTabs } from "./BoxCategoryTabs";
import { DeliveryIntervalSelector } from "./DeliveryIntervalSelector";
import { DeliveryDatePicker } from "./DeliveryDatePicker";
import { AddressSelector } from "./AddressSelector";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { ProductGrid } from "@/components/catalog/ProductGrid";

const DEBOUNCE_MS = 300;

export function SubscriptionWizard({
  products,
  defaultCityId,
  firstDeliveryLeadDays,
  blackoutWeekdays,
}: {
  products: MappedProduct[];
  defaultCityId: string | null;
  firstDeliveryLeadDays: number;
  blackoutWeekdays: number[];
}) {
  const router = useRouter();

  const [step, setStep] = useState<"build" | "checkout">("build");
  const [category, setCategory] = useState<ProductCategory>("vegetables");
  const [deliveryIntervalId, setDeliveryIntervalId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(defaultCityId);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlotId | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const { data: addresses } = useListAddressesQuery();
  const [triggerPreview, { data: previewData, isFetching: previewLoading }] =
    useLazyPreviewPriceQuery();
  const [createSubscription, { isLoading: submitting }] = useCreateSubscriptionMutation();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartItemsKey = JSON.stringify(cart?.items.map((item) => [item.productId, item.quantity]));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cart || cart.items.length === 0 || !deliveryIntervalId || !cityId) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      triggerPreview({
        items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        deliveryIntervalId,
        cityId,
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartItemsKey is a derived, stable serialization of cart.items used purely to detect changes; including cart itself would re-run on every fetch, not just on content changes.
  }, [cartItemsKey, deliveryIntervalId, cityId]);

  const visibleProducts = products.filter((product) => product.category === category);
  const breakdown = previewData?.breakdown;

  async function handleConfirm() {
    if (!deliveryIntervalId || !addressId || !deliveryDate || !timeSlot) return;
    setSubmitError(null);

    try {
      const response = await createSubscription({
        deliveryIntervalId,
        addressId,
        nextDeliveryDate: deliveryDate,
        deliveryTimeSlot: timeSlot,
      }).unwrap();
      router.push(`/subscription/confirmed/${response.subscriptionId}`);
    } catch {
      setSubmitError("تعذر تأكيد الاشتراك — الرجاء المحاولة مرة أخرى");
    }
  }

  const canProceedToCheckout = Boolean(
    deliveryIntervalId && deliveryDate && cart && cart.items.length > 0
  );

  return (
    <div>
      <WizardProgressHeader activeStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-stack-lg">
          {step === "build" ? (
            <>
              <BoxCategoryTabs activeCategory={category} onChange={setCategory} />
              <ProductGrid products={visibleProducts} />
              <DeliveryIntervalSelector value={deliveryIntervalId} onChange={setDeliveryIntervalId} />
              <DeliveryDatePicker
                leadDays={firstDeliveryLeadDays}
                blackoutWeekdays={blackoutWeekdays}
                value={deliveryDate}
                onChange={setDeliveryDate}
              />
            </>
          ) : (
            <>
              <AddressSelector
                value={addressId}
                onChange={(id) => {
                  setAddressId(id);
                  // research.md §4: once a real address is chosen, the
                  // preview switches from the default-city fallback to the
                  // actually-selected address's city.
                  const selected = addresses?.find((address) => address.id === id);
                  if (selected) setCityId(selected.cityId);
                }}
              />
              <TimeSlotPicker value={timeSlot} onChange={setTimeSlot} />
              {submitError && (
                <p className="font-label-sm text-label-sm text-error text-right">{submitError}</p>
              )}
            </>
          )}
        </div>

        <aside className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-28">
          <OrderSummarySidebar
            breakdown={breakdown}
            loading={cartLoading || (previewLoading && !previewData)}
            step={step}
            canProceedToCheckout={canProceedToCheckout}
            submitting={submitting}
            onProceedToCheckout={() => setStep("checkout")}
            onBackToBuild={() => setStep("build")}
            onConfirm={handleConfirm}
          />
        </aside>
      </div>
    </div>
  );
}

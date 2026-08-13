"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/lib/store/cartApi";
import { useListAddressesQuery } from "@/lib/store/addressesApi";
import { useListDeliveryIntervalsQuery } from "@/lib/store/deliveryIntervalsApi";
import { useLazyPreviewPriceQuery } from "@/lib/store/pricingApi";
import { useCreateSubscriptionMutation } from "@/lib/store/subscriptionsApi";
import type { MappedProduct, ProductCategory } from "@/lib/products/mapProductRow";
import type { TimeSlotId } from "@/lib/subscription/timeSlots";
import { useSubscriptionDraft } from "@/lib/subscription/useSubscriptionDraft";
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
  cities,
  defaultCityId,
  firstDeliveryLeadDays,
  blackoutWeekdays,
}: {
  products: MappedProduct[];
  cities: { id: string; nameAr: string }[];
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
  // Same request DeliveryIntervalSelector makes — RTK Query dedupes it, so
  // this costs nothing and lets a restored draft be checked against the
  // intervals that are still active.
  const { data: intervals } = useListDeliveryIntervalsQuery();
  const [triggerPreview, { data: previewData, isFetching: previewLoading }] =
    useLazyPreviewPriceQuery();
  const [createSubscription, { isLoading: submitting }] = useCreateSubscriptionMutation();

  // Selections the server no longer offers are dropped at read time rather
  // than written back with an effect: an admin can deactivate an interval,
  // and an address can be deleted from another tab, in both cases after the
  // draft was written. Deriving keeps the stale value from ever reaching the
  // UI or the submit payload, with no cascading render.
  const effectiveIntervalId =
    deliveryIntervalId && intervals && !intervals.some((i) => i.id === deliveryIntervalId)
      ? null
      : deliveryIntervalId;
  const effectiveAddressId =
    addressId && addresses && !addresses.some((a) => a.id === addressId) ? null : addressId;

  const canProceedToCheckout = Boolean(
    effectiveIntervalId && deliveryDate && cart && cart.items.length > 0
  );

  // Never leave the customer stranded on a checkout step they no longer
  // qualify for (deactivated interval, emptied cart, stale delivery date).
  // Gated on the queries having settled, or a draft restored onto the
  // checkout step would be knocked back to "build" by the in-flight requests
  // alone.
  const effectiveStep =
    step === "checkout" && !cartLoading && intervals && !canProceedToCheckout ? "build" : step;

  // Keeps the in-progress order alive across a refresh or a browser-back.
  // The in-place address dialog (AddressSelector) already removes the
  // navigation that originally lost it; this covers everything else.
  const { clearDraft } = useSubscriptionDraft(
    // The effective values, so a selection already pruned as unavailable is
    // not written straight back into storage.
    {
      step: effectiveStep,
      category,
      deliveryIntervalId: effectiveIntervalId,
      cityId,
      deliveryDate,
      addressId: effectiveAddressId,
      timeSlot,
    },
    (draft) => {
      setStep(draft.step);
      setCategory(draft.category);
      setDeliveryIntervalId(draft.deliveryIntervalId);
      if (draft.cityId) setCityId(draft.cityId);
      setDeliveryDate(draft.deliveryDate);
      setAddressId(draft.addressId);
      setTimeSlot(draft.timeSlot);
    },
    { leadDays: firstDeliveryLeadDays, blackoutWeekdays }
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartItemsKey = JSON.stringify(cart?.items.map((item) => [item.productId, item.quantity]));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cart || cart.items.length === 0 || !effectiveIntervalId || !cityId) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      triggerPreview({
        items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        deliveryIntervalId: effectiveIntervalId,
        cityId,
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartItemsKey is a derived, stable serialization of cart.items used purely to detect changes; including cart itself would re-run on every fetch, not just on content changes.
  }, [cartItemsKey, effectiveIntervalId, cityId]);

  const visibleProducts = products.filter((product) => product.category === category);
  const breakdown = previewData?.breakdown;

  // research.md §4: once a real address is chosen, the preview switches from
  // the default-city fallback to the actually-selected address's city.
  function selectAddress(id: string, addressCityId?: string) {
    setAddressId(id);
    const nextCityId =
      addressCityId ?? addresses?.find((address) => address.id === id)?.cityId;
    if (nextCityId) setCityId(nextCityId);
  }

  async function handleConfirm() {
    if (!effectiveIntervalId || !effectiveAddressId || !deliveryDate || !timeSlot) return;
    setSubmitError(null);

    try {
      const response = await createSubscription({
        deliveryIntervalId: effectiveIntervalId,
        addressId: effectiveAddressId,
        nextDeliveryDate: deliveryDate,
        deliveryTimeSlot: timeSlot,
      }).unwrap();
      // The order exists now — drop the draft so the next visit to
      // /subscription starts clean instead of resurrecting a placed order.
      clearDraft();
      router.push(`/subscription/confirmed/${response.subscriptionId}`);
    } catch {
      setSubmitError("تعذر تأكيد الاشتراك — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <div>
      <WizardProgressHeader activeStep={effectiveStep} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-stack-lg">
          {effectiveStep === "build" ? (
            <>
              <BoxCategoryTabs activeCategory={category} onChange={setCategory} />
              <ProductGrid products={visibleProducts} />
              <DeliveryIntervalSelector value={effectiveIntervalId} onChange={setDeliveryIntervalId} />
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
                value={effectiveAddressId}
                onChange={(id) => selectAddress(id)}
                cities={cities}
                onCreated={(address) => selectAddress(address.id, address.cityId)}
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
            step={effectiveStep}
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

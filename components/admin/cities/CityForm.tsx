"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  useCreateCityMutation,
  useUpdateCityMutation,
  type AdminCity,
} from "@/lib/store/adminCitiesApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// "use client" — create-and-edit in one component, mirroring
// components/address/AddressForm.tsx's own create-vs-edit-in-one-form shape.
//
// `onOptimistic` is handed the row as the user typed it the instant submit is
// pressed, so CityTable can show it before the round trip; `onRevert` undoes
// that if the request is rejected.
export function CityForm({
  existingCity,
  onSuccess,
  onCancel,
  onOptimistic,
  onRevert,
}: {
  existingCity?: AdminCity;
  onSuccess: () => void;
  onCancel: () => void;
  onOptimistic?: (city: AdminCity) => void;
  onRevert?: (id: string) => void;
}) {
  const router = useRouter();
  const [nameAr, setNameAr] = useState(existingCity?.nameAr ?? "");
  const [isActive, setIsActive] = useState(existingCity?.isActive ?? true);
  const [deliveryFeeOverride, setDeliveryFeeOverride] = useState(
    existingCity?.deliveryFeeOverride?.toString() ?? ""
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createCity, { isLoading: creating }] = useCreateCityMutation();
  const [updateCity, { isLoading: updating }] = useUpdateCityMutation();
  const submitting = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const body = {
      nameAr,
      isActive,
      deliveryFeeOverride: deliveryFeeOverride ? Number(deliveryFeeOverride) : null,
    };

    const optimisticId = existingCity?.id ?? `optimistic:${Date.now()}`;
    onOptimistic?.({ id: optimisticId, ...body });

    try {
      if (existingCity) {
        await updateCity({ id: existingCity.id, body }).unwrap();
      } else {
        await createCity(body).unwrap();
      }
      router.refresh();
      onSuccess();
    } catch (err) {
      onRevert?.(optimisticId);
      const data = (err as { data?: { fields?: Record<string, string> } })?.data;
      if (data?.fields) {
        setFieldErrors(data.fields);
      } else {
        setFormError("تعذر حفظ المدينة — الرجاء المحاولة مرة أخرى");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-stack-md rounded-organic border border-outline-variant bg-surface-container-lowest p-stack-lg"
      noValidate
    >
      <FormField
        label="اسم المدينة"
        value={nameAr}
        onChange={(e) => setNameAr(e.target.value)}
        error={fieldErrors.nameAr}
      />
      <FormField
        label="رسوم التوصيل (اختياري)"
        type="number"
        step="0.01"
        value={deliveryFeeOverride}
        onChange={(e) => setDeliveryFeeOverride(e.target.value)}
        error={fieldErrors.deliveryFeeOverride}
      />
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="text-small">نشطة (متاحة للعملاء)</span>
      </label>
      {formError && <p className="text-caption text-error">{formError}</p>}
      <div className="flex gap-stack-sm">
        <Button type="submit" className="flex-1" loading={submitting}>
          حفظ المدينة
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

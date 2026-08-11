"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateCityMutation, useUpdateCityMutation, type AdminCity } from "@/lib/store/adminCitiesApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// "use client" — create-and-edit in one component, mirroring
// components/address/AddressForm.tsx's own create-vs-edit-in-one-form shape.
export function CityForm({
  existingCity,
  onSuccess,
  onCancel,
}: {
  existingCity?: AdminCity;
  onSuccess: () => void;
  onCancel: () => void;
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

    try {
      if (existingCity) {
        await updateCity({ id: existingCity.id, body }).unwrap();
      } else {
        await createCity(body).unwrap();
      }
      router.refresh();
      onSuccess();
    } catch (err) {
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
      className="flex flex-col gap-stack-md w-full bg-surface-container-lowest rounded-organic p-stack-lg border border-outline-variant/30"
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
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="font-body-md text-body-md">نشطة (متاحة للعملاء)</span>
      </label>
      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      <div className="flex gap-stack-sm">
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "جارٍ الحفظ..." : "حفظ المدينة"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

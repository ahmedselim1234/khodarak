"use client";

import { useState, type FormEvent } from "react";
import { addressCreateSchema } from "@/lib/validation/address";
import {
  useCreateAddressMutation,
  useUpdateAddressMutation,
  type Address,
} from "@/lib/store/addressesApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function AddressForm({
  cities,
  existingAddress,
  onSuccess,
  onCancel,
}: {
  cities: { id: string; nameAr: string }[];
  existingAddress?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(existingAddress?.label ?? "");
  const [cityId, setCityId] = useState(existingAddress?.cityId ?? cities[0]?.id ?? "");
  const [district, setDistrict] = useState(existingAddress?.district ?? "");
  const [streetDetails, setStreetDetails] = useState(existingAddress?.streetDetails ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createAddress, { isLoading: creating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const submitting = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload = { label, cityId, district, streetDetails };
    const result = addressCreateSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      if (existingAddress) {
        await updateAddress({ id: existingAddress.id, body: result.data }).unwrap();
      } else {
        await createAddress(result.data).unwrap();
      }
      onSuccess();
    } catch {
      setFormError("تعذر حفظ العنوان — الرجاء المحاولة مرة أخرى.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-stack-md w-full bg-surface-container-lowest rounded-organic p-stack-lg border border-outline-variant/30"
      noValidate
    >
      <FormField
        label="التسمية"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        error={fieldErrors.label}
        placeholder="المنزل، العمل..."
      />
      <label className="flex flex-col gap-2 font-label-sm text-label-sm font-bold text-on-surface-variant">
        المدينة
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 font-normal focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.nameAr}
            </option>
          ))}
        </select>
      </label>
      {fieldErrors.cityId && (
        <p className="font-label-sm text-label-sm text-error">{fieldErrors.cityId}</p>
      )}
      <FormField
        label="الحي"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        error={fieldErrors.district}
      />
      <FormField
        label="تفاصيل الشارع"
        value={streetDetails}
        onChange={(e) => setStreetDetails(e.target.value)}
        error={fieldErrors.streetDetails}
      />
      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      <div className="flex gap-stack-sm">
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "جارٍ الحفظ..." : "حفظ العنوان"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

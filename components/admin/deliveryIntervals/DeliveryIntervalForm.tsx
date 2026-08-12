"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  useCreateIntervalMutation,
  useUpdateIntervalMutation,
  type AdminDeliveryInterval,
} from "@/lib/store/adminDeliveryIntervalsApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// "use client" — create-and-edit in one component, mirroring
// components/admin/cities/CityForm.tsx's shape. `days` is create-only —
// immutable after creation (FR-002 only ever describes editing the
// discount), so the edit form shows it read-only rather than as an input.
export function DeliveryIntervalForm({
  existingInterval,
  onSuccess,
  onCancel,
  onOptimistic,
  onRevert,
}: {
  existingInterval?: AdminDeliveryInterval;
  onSuccess: () => void;
  onCancel: () => void;
  onOptimistic?: (interval: AdminDeliveryInterval) => void;
  onRevert?: (id: string) => void;
}) {
  const router = useRouter();
  const [days, setDays] = useState(existingInterval?.days?.toString() ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    existingInterval?.discountPercent?.toString() ?? ""
  );
  const [isActive, setIsActive] = useState(existingInterval?.isActive ?? true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createInterval, { isLoading: creating }] = useCreateIntervalMutation();
  const [updateInterval, { isLoading: updating }] = useUpdateIntervalMutation();
  const submitting = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const optimisticId = existingInterval?.id ?? `optimistic:${Date.now()}`;

    try {
      if (existingInterval) {
        const body = { discountPercent: Number(discountPercent), isActive };
        onOptimistic?.({ id: optimisticId, days: existingInterval.days, ...body });
        await updateInterval({ id: existingInterval.id, body }).unwrap();
      } else {
        const body = { days: Number(days), discountPercent: Number(discountPercent) };
        onOptimistic?.({ id: optimisticId, isActive: true, ...body });
        await createInterval(body).unwrap();
      }
      router.refresh();
      onSuccess();
    } catch (err) {
      onRevert?.(optimisticId);
      const data = (err as { data?: { error?: string; fields?: Record<string, string> } })?.data;
      if (data?.error === "duplicate_days") {
        setFieldErrors({ days: "يوجد فاصل زمني نشط بنفس عدد الأيام بالفعل" });
      } else if (data?.fields) {
        setFieldErrors(data.fields);
      } else {
        setFormError("تعذر حفظ الفاصل الزمني — الرجاء المحاولة مرة أخرى");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-stack-md rounded-organic border border-outline-variant bg-surface-container-lowest p-stack-lg"
      noValidate
    >
      {existingInterval ? (
        <div>
          <p className="text-caption text-on-surface-variant">عدد الأيام</p>
          <p className="text-small font-semibold">كل {existingInterval.days} يوم</p>
        </div>
      ) : (
        <FormField
          label="عدد الأيام بين كل توصيل"
          type="number"
          min={1}
          max={90}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          error={fieldErrors.days}
        />
      )}
      <FormField
        label="نسبة الخصم (٪)"
        type="number"
        step="0.01"
        min={0}
        max={100}
        value={discountPercent}
        onChange={(e) => setDiscountPercent(e.target.value)}
        error={fieldErrors.discountPercent}
      />
      {existingInterval && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <span className="text-small">نشط (متاح للعملاء)</span>
        </label>
      )}
      {formError && <p className="text-caption text-error">{formError}</p>}
      <div className="flex gap-stack-sm">
        <Button type="submit" className="flex-1" loading={submitting}>
          حفظ الفاصل الزمني
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { settingsUpdateSchema } from "@/lib/validation/settings";
import { useUpdateSettingsMutation, type Settings } from "@/lib/store/settingsAdminApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const DELIVERY_MODE_OPTIONS: Array<{ value: Settings["deliveryMode"]; label: string }> = [
  { value: "flat", label: "رسوم ثابتة" },
  { value: "free_above_threshold", label: "مجاني فوق حد معين" },
  { value: "per_city", label: "حسب المدينة" },
];

const ROUNDING_MODE_OPTIONS: Array<{ value: Settings["roundingMode"]; label: string }> = [
  { value: "none", label: "بدون تقريب" },
  { value: "nearest_0.5", label: "أقرب 0.5" },
  { value: "nearest_1", label: "أقرب 1" },
];

const WEEKDAY_LABELS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();

  const [minOrderValue, setMinOrderValue] = useState(String(settings.minOrderValue));
  const [maxItemsPerBox, setMaxItemsPerBox] = useState(String(settings.maxItemsPerBox));
  const [editCutoffHours, setEditCutoffHours] = useState(String(settings.editCutoffHours));
  const [firstDeliveryLeadDays, setFirstDeliveryLeadDays] = useState(
    String(settings.firstDeliveryLeadDays)
  );
  const [blackoutWeekdays, setBlackoutWeekdays] = useState<number[]>(settings.blackoutWeekdays);
  const [deliveryMode, setDeliveryMode] = useState(settings.deliveryMode);
  const [deliveryFlatFee, setDeliveryFlatFee] = useState(String(settings.deliveryFlatFee));
  const [deliveryFreeThreshold, setDeliveryFreeThreshold] = useState(
    String(settings.deliveryFreeThreshold)
  );
  const [maxPauseDays, setMaxPauseDays] = useState(String(settings.maxPauseDays));
  const [maxPausesPerYear, setMaxPausesPerYear] = useState(String(settings.maxPausesPerYear));
  const [vatPercent, setVatPercent] = useState(String(settings.vatPercent));
  const [pricesIncludeVat, setPricesIncludeVat] = useState(settings.pricesIncludeVat);
  const [roundingMode, setRoundingMode] = useState(settings.roundingMode);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function toggleBlackoutDay(day: number) {
    setBlackoutWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSavedAt(null);

    const payload = {
      minOrderValue: Number(minOrderValue),
      maxItemsPerBox: Number(maxItemsPerBox),
      editCutoffHours: Number(editCutoffHours),
      firstDeliveryLeadDays: Number(firstDeliveryLeadDays),
      blackoutWeekdays,
      deliveryMode,
      deliveryFlatFee: Number(deliveryFlatFee),
      deliveryFreeThreshold: Number(deliveryFreeThreshold),
      maxPauseDays: Number(maxPauseDays),
      maxPausesPerYear: Number(maxPausesPerYear),
      vatPercent: Number(vatPercent),
      pricesIncludeVat,
      roundingMode,
    };

    const result = settingsUpdateSchema.safeParse(payload);
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
      await updateSettings(result.data).unwrap();
      setSavedAt(Date.now());
    } catch {
      // FR-008: the previous valid value stays in effect — this component's
      // local state simply isn't advanced past what was actually saved.
      setFormError("تعذر حفظ الإعدادات — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-lg w-full" noValidate>
      <section className="flex flex-col gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold text-right">
          قواعد الطلب
        </h2>
        <div className="flex gap-stack-md">
          <FormField
            label="الحد الأدنى لقيمة الطلب"
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            error={fieldErrors.minOrderValue}
          />
          <FormField
            label="الحد الأقصى لعدد الأصناف"
            type="number"
            value={maxItemsPerBox}
            onChange={(e) => setMaxItemsPerBox(e.target.value)}
            error={fieldErrors.maxItemsPerBox}
          />
        </div>
        <div className="flex gap-stack-md">
          <FormField
            label="مهلة التعديل (ساعات)"
            type="number"
            value={editCutoffHours}
            onChange={(e) => setEditCutoffHours(e.target.value)}
            error={fieldErrors.editCutoffHours}
          />
          <FormField
            label="مهلة أول توصيل (أيام)"
            type="number"
            value={firstDeliveryLeadDays}
            onChange={(e) => setFirstDeliveryLeadDays(e.target.value)}
            error={fieldErrors.firstDeliveryLeadDays}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">
            أيام بدون توصيل
          </span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, day) => (
              <label key={day} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blackoutWeekdays.includes(day)}
                  onChange={() => toggleBlackoutDay(day)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="font-label-sm text-label-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold text-right">
          التوصيل
        </h2>
        <div className="flex flex-col gap-2 text-right">
          <label className="font-label-sm text-label-sm font-bold text-on-surface-variant">
            نمط رسوم التوصيل
          </label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value as Settings["deliveryMode"])}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
          >
            {DELIVERY_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-stack-md">
          <FormField
            label="الرسوم الثابتة (ر.س)"
            type="number"
            value={deliveryFlatFee}
            onChange={(e) => setDeliveryFlatFee(e.target.value)}
            error={fieldErrors.deliveryFlatFee}
          />
          <FormField
            label="حد التوصيل المجاني (ر.س)"
            type="number"
            value={deliveryFreeThreshold}
            onChange={(e) => setDeliveryFreeThreshold(e.target.value)}
            error={fieldErrors.deliveryFreeThreshold}
          />
        </div>
      </section>

      <section className="flex flex-col gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold text-right">
          قواعد الإيقاف المؤقت
        </h2>
        <div className="flex gap-stack-md">
          <FormField
            label="أقصى أيام إيقاف"
            type="number"
            value={maxPauseDays}
            onChange={(e) => setMaxPauseDays(e.target.value)}
            error={fieldErrors.maxPauseDays}
          />
          <FormField
            label="أقصى مرات إيقاف سنوياً"
            type="number"
            value={maxPausesPerYear}
            onChange={(e) => setMaxPausesPerYear(e.target.value)}
            error={fieldErrors.maxPausesPerYear}
          />
        </div>
      </section>

      <section className="flex flex-col gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold text-right">
          الضريبة والتقريب
        </h2>
        <FormField
          label="نسبة ضريبة القيمة المضافة (٪)"
          type="number"
          value={vatPercent}
          onChange={(e) => setVatPercent(e.target.value)}
          error={fieldErrors.vatPercent}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pricesIncludeVat}
            onChange={(e) => setPricesIncludeVat(e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <span className="font-body-md text-body-md">الأسعار المعروضة تشمل الضريبة</span>
        </label>
        <div className="flex flex-col gap-2 text-right">
          <label className="font-label-sm text-label-sm font-bold text-on-surface-variant">
            طريقة التقريب
          </label>
          <select
            value={roundingMode}
            onChange={(e) => setRoundingMode(e.target.value as Settings["roundingMode"])}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
          >
            {ROUNDING_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      {savedAt && (
        <p className="font-label-sm text-label-sm text-primary text-right">تم حفظ الإعدادات بنجاح</p>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </form>
  );
}

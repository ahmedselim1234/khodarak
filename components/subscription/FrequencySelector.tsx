"use client";

import type { FrequencyKey, Frequencies } from "@/lib/pricing/mapSettingsRow";

const FREQUENCY_LABELS: Record<FrequencyKey, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

// "use client" leaf — offers only settings.frequencies entries with
// enabled: true (FR-004).
export function FrequencySelector({
  frequencies,
  value,
  onChange,
}: {
  frequencies: Frequencies;
  value: FrequencyKey | null;
  onChange: (frequency: FrequencyKey) => void;
}) {
  const enabledKeys = (Object.keys(frequencies) as FrequencyKey[]).filter(
    (key) => frequencies[key].enabled
  );

  if (enabledKeys.length === 0) {
    return (
      <p className="font-label-sm text-label-sm text-error">لا يوجد تردد توصيل متاح حالياً</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">التردد</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {enabledKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={
              value === key
                ? "p-3 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-primary font-bold text-center"
                : "p-3 rounded-2xl border-2 border-outline-variant text-on-surface-variant text-center hover:bg-surface-container-low transition-all"
            }
          >
            {FREQUENCY_LABELS[key]}
            <span className="block font-label-sm text-label-sm">
              خصم {frequencies[key].discountPercent}٪
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

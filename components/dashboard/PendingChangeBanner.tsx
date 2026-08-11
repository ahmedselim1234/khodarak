import type { SubscriptionPendingChange } from "@/lib/store/dashboardApi";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

// Presentational — shown when a pending change exists (US2 Acceptance
// Scenario 6): summarizes what changes and from which delivery, without
// touching the already-locked next delivery shown above it.
export function PendingChangeBanner({ pendingChange }: { pendingChange: SubscriptionPendingChange }) {
  return (
    <div className="bg-tertiary/10 border border-tertiary/30 rounded-2xl p-stack-md flex flex-col gap-1">
      <p className="font-bold text-tertiary">لديك تغيير قيد الانتظار</p>
      <p className="font-label-sm text-label-sm text-on-surface-variant">
        سيتم تطبيق التردد {FREQUENCY_LABELS[pendingChange.frequency]} والصندوق الجديد اعتباراً من
        توصيلة {pendingChange.effectiveFrom} — التوصيلة القادمة لن تتأثر.
      </p>
      <p className="font-label-sm text-label-sm text-primary font-bold">
        السعر الجديد: {pendingChange.priceBreakdown.totalPerDelivery.toFixed(2)} ر.س
      </p>
    </div>
  );
}

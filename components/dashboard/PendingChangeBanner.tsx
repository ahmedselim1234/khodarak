import type { SubscriptionPendingChange } from "@/lib/store/dashboardApi";
import { formatDeliveryCadenceLabel } from "@/lib/pricing/deliveryInterval";

// Presentational — shown when a pending change exists (US2 Acceptance
// Scenario 6): summarizes what changes and from which delivery, without
// touching the already-locked next delivery shown above it.
export function PendingChangeBanner({ pendingChange }: { pendingChange: SubscriptionPendingChange }) {
  return (
    // Amber container rather than the old washed-out tertiary tint — a pending
    // change is a "needs your attention" state and should read as one. The
    // border-s spine matches the Alert primitive.
    // The spine is `warning` (#9A6300), not `accent`: accent is a fill-only
    // token and would be near-invisible against its own container tint.
    <div className="animate-slide-in-start rounded-2xl border border-warning/30 border-s-4 border-s-warning bg-accent-container p-stack-md flex flex-col gap-1">
      <p className="font-bold text-on-accent-container">لديك تغيير قيد الانتظار</p>
      <p className="font-label-sm text-label-sm text-on-surface-variant">
        سيتم تطبيق التردد{" "}
        {formatDeliveryCadenceLabel(pendingChange.frequency, pendingChange.deliveryInterval)}{" "}
        والصندوق الجديد اعتباراً من توصيلة {pendingChange.effectiveFrom} — التوصيلة القادمة لن
        تتأثر.
      </p>
      <p className="font-label-sm text-label-sm text-primary font-bold">
        السعر الجديد: {pendingChange.priceBreakdown.totalPerDelivery.toFixed(2)} ر.س
      </p>
    </div>
  );
}

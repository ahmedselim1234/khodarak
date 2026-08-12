import Link from "next/link";
import { XCircle } from "lucide-react";
import type { SubscriptionDetail } from "@/lib/store/dashboardApi";
import { formatDeliveryCadenceLabel } from "@/lib/pricing/deliveryInterval";
import { SubscriptionHealthBadge } from "./SubscriptionHealthBadge";

// Presentational — active/paused/cancelled variants (US1 Acceptance
// Scenarios 1–3). The empty (never-subscribed) state is handled by the
// caller (SubscriptionDashboard) before this component is ever rendered,
// since it has nothing of this shape to show.
export function SubscriptionStatusCard({
  subscription,
  onEdit,
  onPause,
  onResumeNow,
  onCancel,
}: {
  subscription: SubscriptionDetail;
  onEdit: () => void;
  onPause: () => void;
  onResumeNow: () => void;
  onCancel: () => void;
}) {
  if (subscription.status === "cancelled") {
    return (
      <div className="bg-surface rounded-[20px] p-stack-lg shadow-sm border border-outline-variant/30 text-center flex flex-col gap-stack-sm items-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <XCircle className="size-6" aria-hidden="true" />
        </div>
        <p className="text-h3 text-on-surface">الاشتراك ملغى</p>
        <p className="font-body-md text-body-md text-on-surface-variant">
          لا يمكن إعادة تفعيل هذا الاشتراك — يمكنك بدء اشتراك جديد في أي وقت.
        </p>
        <Link
          href="/subscription"
          className="mt-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          بدء اشتراك جديد
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[20px] p-stack-lg shadow-sm border border-outline-variant/30 flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-row-reverse">
        <SubscriptionHealthBadge health={subscription.health} />
        <span
          className={
            subscription.status === "paused"
              ? "font-bold text-secondary"
              : "font-bold text-primary"
          }
        >
          {subscription.status === "paused" ? "متوقف مؤقتاً" : "نشط"}
        </span>
      </div>

      {subscription.status === "paused" ? (
        <div className="text-center py-stack-md">
          <p className="font-body-md text-body-md text-on-surface-variant">
            سيتم استئناف الاشتراك تلقائياً في
          </p>
          <p className="font-headline-md text-headline-md font-bold text-primary">
            {subscription.pausedUntil}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-sm text-center">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              التوصيلة القادمة
            </p>
            <p className="font-bold">{subscription.nextDeliveryDate}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">التردد</p>
            <p className="font-bold">
              {formatDeliveryCadenceLabel(subscription.frequency, subscription.deliveryInterval)}
            </p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              المبلغ القادم
            </p>
            <p className="font-bold text-primary">
              {subscription.priceBreakdown.totalPerDelivery.toFixed(2)} ر.س
            </p>
          </div>
        </div>
      )}

      {subscription.status === "active" && subscription.items.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-outline-variant/20 pt-stack-sm">
          {subscription.items.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between font-label-sm text-label-sm text-on-surface-variant"
            >
              <span>{item.productNameAr}</span>
              <span>× {item.quantity}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-stack-sm justify-end pt-stack-sm border-t border-outline-variant/20">
        {subscription.status === "active" && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
            >
              تعديل الصندوق
            </button>
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-2 rounded-full border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all active:scale-95"
            >
              إيقاف مؤقت
            </button>
          </>
        )}
        {subscription.status === "paused" && (
          <button
            type="button"
            onClick={onResumeNow}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold hover:opacity-90 transition-all active:scale-95"
          >
            استئناف الآن
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-error font-bold hover:bg-error/10 transition-all active:scale-95"
        >
          إلغاء الاشتراك
        </button>
      </div>
    </div>
  );
}

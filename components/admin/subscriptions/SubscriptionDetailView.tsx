import { PriceBreakdownCard } from "@/components/pricing/PriceBreakdownCard";
import { SubscriptionAdminActions } from "./SubscriptionAdminActions";
import { formatDeliveryCadenceLabel } from "@/lib/pricing/deliveryInterval";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  active: "نشط",
  paused: "متوقف مؤقتاً",
  cancelled: "ملغي",
};

export type AdminSubscriptionDetail = {
  id: string;
  status: string;
  frequency: string;
  deliveryIntervalDays: number | null;
  nextDeliveryDate: string;
  pausedUntil: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  addressLabel: string;
  addressCity: string | null;
  items: Array<{ productNameAr: string; quantity: number }>;
  priceBreakdown: PriceBreakdown;
  payments: Array<{
    id: string;
    createdAt: string;
    amountHalalas: number | null;
    status: string;
    failureReason: string | null;
    attemptNumber: number;
    kind: string;
  }>;
  dunning: { renewalAttemptCount: number; nextRenewalAttemptDate: string | null } | null;
};

// Server Component — full admin-facing subscription detail (FR-006):
// items, frequency, next delivery, price breakdown, address, payment
// history, and Phase 7 dunning state if in progress. Hosts the
// pause/cancel entry points via SubscriptionAdminActions.
export function SubscriptionDetailView({ subscription }: { subscription: AdminSubscriptionDetail }) {
  return (
    <div className="flex flex-col gap-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-headline-md text-headline-md font-bold">
              {subscription.customerName}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {subscription.customerEmail} — {subscription.customerPhone}
            </p>
          </div>
          <span className="font-bold text-primary">
            {STATUS_LABELS[subscription.status] ?? subscription.status}
          </span>
        </div>

        {subscription.status === "paused" && (
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
            الاستئناف: {subscription.pausedUntil ?? "غير محدد (إيقاف مفتوح)"}
          </p>
        )}

        {subscription.dunning && (
          <p className="font-label-sm text-label-sm text-error mt-2">
            محاولات تجديد فاشلة: {subscription.dunning.renewalAttemptCount} — المحاولة القادمة:{" "}
            {subscription.dunning.nextRenewalAttemptDate ?? "—"}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-sm text-center mt-stack-md">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              التوصيلة القادمة
            </p>
            <p className="font-bold">{subscription.nextDeliveryDate}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">التردد</p>
            <p className="font-bold">
              {formatDeliveryCadenceLabel(subscription.frequency, {
                days: subscription.deliveryIntervalDays ?? 0,
              })}
            </p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">العنوان</p>
            <p className="font-bold">
              {subscription.addressLabel} — {subscription.addressCity}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-1 border-t border-outline-variant/20 pt-stack-sm mt-stack-md">
          {subscription.items.map((item, index) => (
            <li
              key={index}
              className="flex justify-between font-label-sm text-label-sm text-on-surface-variant"
            >
              <span>{item.productNameAr}</span>
              <span>× {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <PriceBreakdownCard breakdown={subscription.priceBreakdown} />

      <div className="bg-surface rounded-[20px] p-stack-md border border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md font-bold mb-stack-sm">
          سجل المدفوعات
        </h3>
        {subscription.payments.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">لا توجد مدفوعات</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subscription.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex justify-between items-center border-b border-outline-variant/20 py-2"
              >
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {payment.createdAt} — {payment.kind === "renewal" ? "تجديد" : "دفعة أولى"} #
                    {payment.attemptNumber}
                  </p>
                  {payment.failureReason && (
                    <p className="font-label-sm text-label-sm text-error">
                      {payment.failureReason}
                    </p>
                  )}
                </div>
                <p className="font-bold">
                  {payment.amountHalalas ? (payment.amountHalalas / 100).toFixed(2) : "—"} ر.س —{" "}
                  {payment.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SubscriptionAdminActions subscriptionId={subscription.id} status={subscription.status} />
    </div>
  );
}

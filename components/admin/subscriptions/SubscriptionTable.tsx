import Link from "next/link";
import type { AdminSubscriptionRow } from "@/lib/admin/queryAdminSubscriptions";
import { formatDeliveryCadenceLabel } from "@/lib/pricing/deliveryInterval";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  active: "نشط",
  paused: "متوقف مؤقتاً",
  cancelled: "ملغي",
};

export function SubscriptionTable({ subscriptions }: { subscriptions: AdminSubscriptionRow[] }) {
  if (subscriptions.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        لا توجد اشتراكات مطابقة
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
            <th className="py-3 px-2">العميل</th>
            <th className="py-3 px-2">التردد</th>
            <th className="py-3 px-2">التوصيلة القادمة</th>
            <th className="py-3 px-2">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="border-b border-outline-variant/10">
              <td className="py-3 px-2">
                <Link
                  href={`/admin/subscriptions/${subscription.id}`}
                  className="font-body-md text-body-md text-primary hover:underline"
                >
                  {subscription.customerName}
                </Link>
              </td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {formatDeliveryCadenceLabel(subscription.frequency, {
                  days: subscription.deliveryIntervalDays ?? 0,
                })}
              </td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {subscription.nextDeliveryDate}
              </td>
              <td className="py-3 px-2 font-label-sm text-label-sm">
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

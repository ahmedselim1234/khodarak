import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export type OrderListRow = {
  id: string;
  scheduledDate: string;
  status: string;
  totalPerDelivery: number;
};

// Server Component — date/status/total rows (US4). Empty state when the
// caller has no orders yet (Acceptance Scenario 3).
export function OrderList({ orders }: { orders: OrderListRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-[20px] p-stack-lg text-center border border-outline-variant/30">
        <p className="font-body-md text-body-md text-on-surface-variant">
          لا توجد طلبات بعد
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-stack-sm">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/dashboard/orders/${order.id}`}
          className="flex items-center justify-between bg-surface rounded-2xl p-stack-md border border-outline-variant/30 hover:bg-surface-container-low transition-all"
        >
          <div>
            <p className="font-bold">{order.scheduledDate}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
          <p className="font-bold text-primary">{order.totalPerDelivery.toFixed(2)} ر.س</p>
        </Link>
      ))}
    </div>
  );
}

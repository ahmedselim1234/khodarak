import type { AdminOrderRow } from "@/lib/admin/queryAdminOrders";
import { OrderRowActions } from "./OrderRowActions";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export function OrderTable({ orders }: { orders: AdminOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        لا توجد طلبات مطابقة
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
            <th className="py-3 px-2">العميل</th>
            <th className="py-3 px-2">تاريخ التوصيل</th>
            <th className="py-3 px-2">الحالة</th>
            <th className="py-3 px-2">الإجمالي</th>
            <th className="py-3 px-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-outline-variant/10">
              <td className="py-3 px-2 font-body-md text-body-md">{order.customerName}</td>
              <td className="py-3 px-2 font-body-md text-body-md">{order.scheduledDate}</td>
              <td className="py-3 px-2 font-label-sm text-label-sm">
                {STATUS_LABELS[order.status] ?? order.status}
              </td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {order.totalPerDelivery.toFixed(2)} ر.س
              </td>
              <td className="py-3 px-2">
                <OrderRowActions id={order.id} status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

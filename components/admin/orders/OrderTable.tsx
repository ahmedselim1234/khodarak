"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrderRow } from "@/lib/admin/queryAdminOrders";
import { useUpdateOrderStatusMutation } from "@/lib/store/adminOrdersApi";
import { useOptimisticRows } from "@/lib/admin/useOptimisticRows";
import {
  isValidOrderStatusTransition,
  type OrderStatus,
} from "@/lib/orders/orderStatusTransition";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { StatusPill } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Feedback";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const ACTION_LABELS: Record<OrderStatus, string> = {
  pending: "",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "إلغاء",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "out_for_delivery", "delivered", "cancelled"];

// "use client" — the status cell and its actions have to move together for a
// transition to feel instant, so the whole table is the client boundary now
// rather than just the buttons. Rows are still fetched server-side and passed
// in; `overrides` is only the not-yet-confirmed layer on top.
export function OrderTable({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const { rows: mergedOrders, setOptimistic, revert } = useOptimisticRows(orders);
  const [error, setError] = useState<string | null>(null);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  async function handleTransition(order: AdminOrderRow, to: OrderStatus) {
    setError(null);
    setOptimistic({ ...order, status: to });

    try {
      await updateOrderStatus({ id: order.id, status: to }).unwrap();
      router.refresh();
    } catch (err) {
      revert(order.id);
      const data = (err as { data?: { error?: string } })?.data;
      setError(
        data?.error === "status_changed"
          ? "تم تغيير حالة الطلب من قِبل مشرف آخر — يرجى إعادة التحميل."
          : "تعذر تحديث حالة الطلب."
      );
    }
  }

  if (orders.length === 0) {
    return (
      <p className="py-stack-lg text-center text-small text-on-surface-variant">
        لا توجد طلبات مطابقة
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-stack-sm">
      {error && <Alert tone="danger">{error}</Alert>}

      <Table>
        <THead>
          <TRow>
            <TH>العميل</TH>
            <TH>تاريخ التوصيل</TH>
            <TH>الحالة</TH>
            <TH numeric>الإجمالي</TH>
            <TH>إجراءات</TH>
          </TRow>
        </THead>
        <TBody>
          {mergedOrders.map((order) => {
            const status = order.status;
            const transitions = ALL_STATUSES.filter((next) =>
              isValidOrderStatusTransition(status, next)
            );

            return (
              <TRow key={order.id} interactive>
                <TD>{order.customerName}</TD>
                <TD className="tabular">{order.scheduledDate}</TD>
                <TD>
                  <StatusPill status={status} label={STATUS_LABELS[status] ?? status} />
                </TD>
                <TD numeric>{formatPrice(order.totalPerDelivery)}</TD>
                <TD>
                  {transitions.length === 0 ? (
                    <span className="text-caption text-on-surface-variant">نهائي</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      {transitions.map((next) => (
                        <button
                          key={next}
                          type="button"
                          onClick={() => handleTransition(order, next)}
                          aria-label={`${ACTION_LABELS[next]} — طلب ${order.customerName}`}
                          className={`text-caption font-semibold transition-opacity duration-fast hover:underline ${
                            next === "cancelled" ? "text-error" : "text-primary"
                          }`}
                        >
                          {ACTION_LABELS[next]}
                        </button>
                      ))}
                    </div>
                  )}
                </TD>
              </TRow>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

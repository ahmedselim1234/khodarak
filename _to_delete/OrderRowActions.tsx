"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateOrderStatusMutation } from "@/lib/store/adminOrdersApi";
import { isValidOrderStatusTransition, type OrderStatus } from "@/lib/orders/orderStatusTransition";

const NEXT_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "",
  out_for_delivery: "تحويل لقيد التوصيل",
  delivered: "تحويل لتم التوصيل",
  cancelled: "إلغاء الطلب",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "out_for_delivery", "delivered", "cancelled"];

// "use client" — shows only the currently-valid next actions for this
// row's status (orderStatusTransition.ts's own rule), submits via
// updateOrderStatus, calls router.refresh() on success.
export function OrderRowActions({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const availableTransitions = ALL_STATUSES.filter((next) =>
    isValidOrderStatusTransition(status, next)
  );

  async function handleTransition(next: OrderStatus) {
    setError(null);
    try {
      await updateOrderStatus({ id, status: next }).unwrap();
      router.refresh();
    } catch (err) {
      const data = (err as { data?: { error?: string } })?.data;
      if (data?.error === "status_changed") {
        setError("تم تغيير حالة الطلب من قبل مشرف آخر — يرجى إعادة التحميل");
      } else {
        setError("تعذر تحديث حالة الطلب");
      }
    }
  }

  if (availableTransitions.length === 0) {
    return <span className="font-label-sm text-label-sm text-on-surface-variant">نهائي</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {availableTransitions.map((next) => (
          <button
            key={next}
            type="button"
            disabled={isLoading}
            onClick={() => handleTransition(next)}
            className={
              next === "cancelled"
                ? "font-label-sm text-label-sm text-error hover:underline disabled:opacity-50"
                : "font-label-sm text-label-sm text-primary hover:underline disabled:opacity-50"
            }
          >
            {NEXT_STATUS_LABEL[next]}
          </button>
        ))}
      </div>
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}

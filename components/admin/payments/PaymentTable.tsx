import type { AdminPaymentRow } from "@/lib/admin/queryAdminPayments";

const STATUS_LABELS: Record<string, string> = {
  initiated: "قيد المعالجة",
  paid: "ناجحة",
  failed: "فاشلة",
};

export function PaymentTable({ payments }: { payments: AdminPaymentRow[] }) {
  if (payments.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        لا توجد عمليات دفع مطابقة
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
            <th className="py-3 px-2">العميل</th>
            <th className="py-3 px-2">التاريخ</th>
            <th className="py-3 px-2">النوع</th>
            <th className="py-3 px-2">المحاولة</th>
            <th className="py-3 px-2">المبلغ</th>
            <th className="py-3 px-2">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-outline-variant/10">
              <td className="py-3 px-2 font-body-md text-body-md">{payment.customerName}</td>
              <td className="py-3 px-2 font-label-sm text-label-sm">{payment.createdAt}</td>
              <td className="py-3 px-2 font-label-sm text-label-sm">
                {payment.kind === "renewal" ? "تجديد" : "دفعة أولى"}
              </td>
              <td className="py-3 px-2 font-label-sm text-label-sm">#{payment.attemptNumber}</td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {payment.amountHalalas ? (payment.amountHalalas / 100).toFixed(2) : "—"} ر.س
              </td>
              <td className="py-3 px-2 font-label-sm text-label-sm">
                {STATUS_LABELS[payment.status] ?? payment.status}
                {payment.failureReason && (
                  <span className="block text-error">{payment.failureReason}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

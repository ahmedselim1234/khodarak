const STATUS_LABELS: Record<string, string> = {
  initiated: "قيد المعالجة",
  paid: "ناجحة",
  failed: "فاشلة",
};

export type PaymentHistoryRow = {
  id: string;
  createdAt: string;
  amountHalalas: number;
  status: string;
  failureReason: string | null;
};

// Server Component — date/amount/outcome rows (US5, FR-022).
export function PaymentHistoryList({ payments }: { payments: PaymentHistoryRow[] }) {
  if (payments.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        لا توجد عمليات دفع سابقة
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex justify-between items-center border-b border-outline-variant/20 py-2"
        >
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {payment.createdAt}
            </p>
            {payment.failureReason && (
              <p className="font-label-sm text-label-sm text-error">{payment.failureReason}</p>
            )}
          </div>
          <div className="text-left">
            <p className="font-bold">{(payment.amountHalalas / 100).toFixed(2)} ر.س</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {STATUS_LABELS[payment.status] ?? payment.status}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { CreditCard } from "lucide-react";

export type SavedPaymentMethod = {
  id: string;
  brand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
};

// "use client" leaf — lists the customer's saved active payment methods
// (passed down from the Server Component parent) plus an "add a new card"
// option (FR-002).
export function PaymentMethodSelector({
  methods,
  value,
  onSelectSaved,
  onAddNew,
}: {
  methods: SavedPaymentMethod[];
  value: "new" | string;
  onSelectSaved: (paymentMethodId: string) => void;
  onAddNew: () => void;
}) {
  if (methods.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">طريقة الدفع</h3>
      <div className="flex flex-col gap-2">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelectSaved(method.id)}
            className={
              value === method.id
                ? "p-4 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-right flex items-center justify-between"
                : "p-4 rounded-2xl border-2 border-outline-variant text-right hover:bg-surface-container-low transition-all flex items-center justify-between"
            }
          >
            <span className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" aria-hidden="true" />
              <span>
                {method.brand} •••• {method.lastFour}
              </span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={onAddNew}
          className={
            value === "new"
              ? "p-4 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-right"
              : "p-4 rounded-2xl border-2 border-dashed border-outline-variant text-right hover:bg-surface-container-low transition-all"
          }
        >
          إضافة بطاقة جديدة
        </button>
      </div>
    </div>
  );
}

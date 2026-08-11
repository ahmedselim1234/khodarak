"use client";

import { useState } from "react";
import { useCancelSubscriptionMutation } from "@/lib/store/dashboardApi";

// "use client" — explicit confirm step (FR-014, US3 Acceptance Scenario 6):
// dismissing without confirming leaves the subscription completely
// unchanged.
export function CancelDialog({
  subscriptionId,
  onClose,
}: {
  subscriptionId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [cancelSubscription, { isLoading }] = useCancelSubscriptionMutation();

  async function handleConfirm() {
    setError(null);
    try {
      await cancelSubscription(subscriptionId).unwrap();
      onClose();
    } catch {
      setError("تعذر إلغاء الاشتراك — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-md w-full flex flex-col gap-stack-md">
        <h3 className="font-headline-md text-headline-md font-bold text-error">
          إلغاء الاشتراك نهائياً
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          لن يتم جدولة أي توصيلات قادمة، ولا يمكن إعادة تفعيل هذا الاشتراك لاحقاً — سيتوجب عليك
          بدء اشتراك جديد إن أردت استئناف الخدمة.
        </p>
        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
        <div className="flex gap-stack-sm justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-full border-2 border-outline-variant font-bold"
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-error text-on-error font-bold disabled:opacity-50"
          >
            {isLoading ? "جارٍ الإلغاء..." : "نعم، إلغاء الاشتراك"}
          </button>
        </div>
      </div>
    </div>
  );
}

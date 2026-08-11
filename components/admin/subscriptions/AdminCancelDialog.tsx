"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminCancelSubscriptionMutation } from "@/lib/store/adminSubscriptionsApi";

// "use client" — required reason field + confirm step (FR-008).
export function AdminCancelDialog({
  subscriptionId,
  onClose,
}: {
  subscriptionId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cancelSubscription, { isLoading }] = useAdminCancelSubscriptionMutation();

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("السبب مطلوب");
      return;
    }
    setError(null);
    try {
      await cancelSubscription({ id: subscriptionId, reason }).unwrap();
      router.refresh();
      onClose();
    } catch {
      setError("تعذر إلغاء الاشتراك — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-md w-full flex flex-col gap-stack-md">
        <h3 className="font-headline-md text-headline-md font-bold text-error">
          إلغاء الاشتراك نهائياً (إجراء إداري)
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          لا يمكن إعادة تفعيل هذا الاشتراك لاحقاً.
        </p>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            السبب (مطلوب — للاستخدام الداخلي فقط)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-outline-variant rounded-xl px-4 py-2"
            rows={3}
          />
        </label>
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

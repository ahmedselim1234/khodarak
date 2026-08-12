"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminPauseSubscriptionMutation } from "@/lib/store/adminSubscriptionsApi";

// "use client" — required reason field + optional resume date, reusing
// Phase 6's PauseDialog's layout shape but posting to the admin endpoint
// and requiring a reason (FR-007).
export function AdminPauseDialog({
  subscriptionId,
  onClose,
  onPaused,
}: {
  subscriptionId: string;
  onClose: () => void;
  onPaused?: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pauseSubscription, { isLoading }] = useAdminPauseSubscriptionMutation();

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("السبب مطلوب");
      return;
    }
    setError(null);
    try {
      await pauseSubscription({
        id: subscriptionId,
        reason,
        resumeDate: resumeDate || null,
      }).unwrap();
      onPaused?.();
      router.refresh();
      onClose();
    } catch {
      setError("تعذر إيقاف الاشتراك — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-md w-full flex flex-col gap-stack-md">
        <h3 className="font-headline-md text-headline-md font-bold">
          إيقاف الاشتراك (إجراء إداري)
        </h3>
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
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            تاريخ الاستئناف (اختياري — اتركه فارغاً لإيقاف غير محدد المدة)
          </span>
          <input
            type="date"
            value={resumeDate}
            onChange={(e) => setResumeDate(e.target.value)}
            className="border border-outline-variant rounded-xl px-4 py-2"
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
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold disabled:opacity-50"
          >
            {isLoading ? "جارٍ الإيقاف..." : "تأكيد الإيقاف"}
          </button>
        </div>
      </div>
    </div>
  );
}

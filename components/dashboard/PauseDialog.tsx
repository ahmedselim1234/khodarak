"use client";

import { useState } from "react";
import { usePauseSubscriptionMutation } from "@/lib/store/dashboardApi";

const LIMIT_MESSAGES: Record<string, string> = {
  max_pause_days: "مدة الإيقاف المطلوبة تتجاوز الحد الأقصى المسموح به",
  max_pauses_per_year: "لقد استخدمت الحد الأقصى لعدد مرات الإيقاف خلال العام الماضي",
};

// "use client" — resume-date picker, submits via
// usePauseSubscriptionMutation, surfaces pause_limit_exceeded messages
// identifying which limit was hit (US3 Acceptance Scenario 2).
export function PauseDialog({
  subscriptionId,
  onClose,
}: {
  subscriptionId: string;
  onClose: () => void;
}) {
  const [resumeDate, setResumeDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pauseSubscription, { isLoading }] = usePauseSubscriptionMutation();

  async function handleSubmit() {
    if (!resumeDate) return;
    setError(null);
    try {
      await pauseSubscription({ id: subscriptionId, resumeDate }).unwrap();
      onClose();
    } catch (err) {
      const data = (err as { data?: { error?: string; limit?: string } })?.data;
      if (data?.error === "pause_limit_exceeded" && data.limit) {
        setError(LIMIT_MESSAGES[data.limit] ?? "تعذر إيقاف الاشتراك مؤقتاً");
      } else {
        setError("تعذر إيقاف الاشتراك مؤقتاً — الرجاء المحاولة مرة أخرى");
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-md w-full flex flex-col gap-stack-md">
        <h3 className="font-headline-md text-headline-md font-bold">إيقاف الاشتراك مؤقتاً</h3>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            استئناف في تاريخ
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
            disabled={!resumeDate || isLoading}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold disabled:opacity-50"
          >
            {isLoading ? "جارٍ الإيقاف..." : "تأكيد الإيقاف"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CardTokenizationForm } from "@/components/payment/CardTokenizationForm";
import { useReplacePaymentMethodMutation } from "@/lib/store/settingsApi";

// "use client" — reuses CardTokenizationForm (Phase 5, save_only/amount:0,
// unchanged) to tokenize a new card, then posts the resulting payment id
// (never card fields) to POST /api/payment-methods. router.refresh() on
// success re-fetches the server-rendered SavedCardSummary above it, rather
// than this dialog owning its own query cache for a value that only ever
// changes from here (contracts/settings-api.md's Notes).
export function ReplaceCardDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [replacePaymentMethod, { isLoading }] = useReplacePaymentMethodMutation();

  async function handleToken(_token: string, paymentId: string) {
    setError(null);
    try {
      await replacePaymentMethod({ moyasarPaymentId: paymentId }).unwrap();
      router.refresh();
      onClose();
    } catch {
      setError("تعذر حفظ البطاقة — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg max-w-md w-full flex flex-col gap-stack-md">
        <h3 className="font-headline-md text-headline-md font-bold">استبدال البطاقة</h3>
        <CardTokenizationForm onToken={handleToken} onError={setError} />
        {isLoading && (
          <p className="font-label-sm text-label-sm text-on-surface-variant">جارٍ الحفظ...</p>
        )}
        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-full border-2 border-outline-variant font-bold self-end"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

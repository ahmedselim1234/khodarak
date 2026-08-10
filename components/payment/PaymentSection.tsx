"use client";

import { useState } from "react";
import { CardTokenizationForm } from "./CardTokenizationForm";
import { PaymentMethodSelector, type SavedPaymentMethod } from "./PaymentMethodSelector";

// "use client" orchestrator — method choice, the recurring-charge consent
// checkbox (FR-003), submit → POST /api/subscriptions/[id]/pay → redirect
// to the returned 3DS transactionUrl. Surfaces the most recent decline
// reason and the throttled state (US3) passed down from the Server
// Component parent.
export function PaymentSection({
  subscriptionId,
  totalPerDelivery,
  savedMethods,
  recentFailureReason,
  throttled,
}: {
  subscriptionId: string;
  totalPerDelivery: number;
  savedMethods: SavedPaymentMethod[];
  recentFailureReason?: string | null;
  throttled?: boolean;
}) {
  const [selection, setSelection] = useState<"new" | string>(
    savedMethods.length > 0 ? savedMethods[0].id : "new"
  );
  const [moyasarToken, setMoyasarToken] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingSavedMethod = selection !== "new";
  const canSubmit = consentGiven && (usingSavedMethod || Boolean(moyasarToken)) && !throttled;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const body = usingSavedMethod
        ? { consentGiven: true, paymentMethodId: selection }
        : { consentGiven: true, moyasarToken };

      const response = await fetch(`/api/subscriptions/${subscriptionId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(`محاولات كثيرة جداً — الرجاء المحاولة بعد ${Math.ceil((data.retryAfterSeconds ?? 900) / 60)} دقيقة`);
        } else {
          setError("تعذر بدء عملية الدفع — الرجاء المحاولة مرة أخرى");
        }
        setSubmitting(false);
        return;
      }

      window.location.href = data.transactionUrl;
    } catch {
      setError("تعذر بدء عملية الدفع — الرجاء المحاولة مرة أخرى");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-md shadow-sm border border-outline-variant/30">
        <p className="font-body-md text-body-md text-on-surface-variant">المبلغ المستحق</p>
        <p className="font-headline-md text-headline-md text-primary font-bold">
          {totalPerDelivery.toFixed(2)} ر.س
        </p>
      </div>

      <PaymentMethodSelector
        methods={savedMethods}
        value={selection}
        onSelectSaved={setSelection}
        onAddNew={() => setSelection("new")}
      />

      {!usingSavedMethod && (
        <CardTokenizationForm
          onToken={(token) => {
            setMoyasarToken(token);
            setError(null);
          }}
          onError={setError}
        />
      )}

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="w-4 h-4 mt-1 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="font-body-md text-body-md text-on-surface-variant">
          أوافق على استخدام هذه البطاقة لشحن قيمة اشتراكي بشكل متكرر حسب التردد الذي اخترته
        </span>
      </label>

      {recentFailureReason && (
        <p className="font-label-sm text-label-sm text-error">
          فشلت آخر محاولة دفع: {recentFailureReason}
        </p>
      )}
      {throttled && (
        <p className="font-label-sm text-label-sm text-error">
          محاولات كثيرة جداً — الرجاء الانتظار قليلاً قبل المحاولة مرة أخرى
        </p>
      )}
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-headline-md shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {submitting ? "جارٍ التحويل..." : "ادفع الآن"}
      </button>
    </div>
  );
}

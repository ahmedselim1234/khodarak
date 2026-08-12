"use client";

import type { PriceBreakdown } from "@/lib/pricing/calculate";
import { PriceBreakdownCard } from "@/components/pricing/PriceBreakdownCard";
import { Button } from "@/components/ui/Button";

// Wraps the existing PriceBreakdownCard (Phase 3, reused as-is) plus the
// step's primary action. FR-009/SC-004: the action is disabled whenever the
// live breakdown violates the minimum order value or max items per box —
// PriceBreakdownCard already renders the underlying messages, this wires the
// button's own disabled state to those same flags.
export function OrderSummarySidebar({
  breakdown,
  loading,
  step,
  canProceedToCheckout,
  submitting,
  onProceedToCheckout,
  onBackToBuild,
  onConfirm,
}: {
  breakdown: PriceBreakdown | undefined;
  loading: boolean;
  step: "build" | "checkout";
  canProceedToCheckout: boolean;
  submitting: boolean;
  onProceedToCheckout: () => void;
  onBackToBuild: () => void;
  onConfirm: () => void;
}) {
  const ruleViolation = breakdown
    ? !breakdown.meetsMinimumOrderValue || !breakdown.withinMaxItemsPerBox
    : false;

  return (
    <div className="flex flex-col gap-stack-md">
      {loading || !breakdown ? (
        <div className="bg-surface rounded-[20px] p-stack-md shadow-sm border border-outline-variant/30 text-center text-on-surface-variant">
          {loading ? "جارٍ الحساب..." : "اختر منتجات لعرض السعر"}
        </div>
      ) : (
        <PriceBreakdownCard breakdown={breakdown} />
      )}

      {step === "build" ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            disabled={!breakdown || ruleViolation || !canProceedToCheckout}
            onClick={onProceedToCheckout}
          >
            متابعة لإتمام الطلب
          </Button>
          {breakdown && !ruleViolation && !canProceedToCheckout && (
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
              اختر تكرار التوصيل وتاريخ أول توصيلة للمتابعة
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-stack-sm">
          <Button
            type="button"
            className="w-full"
            disabled={!breakdown || ruleViolation || submitting}
            onClick={onConfirm}
          >
            {submitting ? "جارٍ التأكيد..." : "تأكيد الاشتراك"}
          </Button>
          <button
            type="button"
            onClick={onBackToBuild}
            disabled={submitting}
            className="font-label-sm text-label-sm text-primary hover:underline disabled:opacity-50"
          >
            الرجوع لتعديل الصندوق
          </button>
        </div>
      )}
    </div>
  );
}

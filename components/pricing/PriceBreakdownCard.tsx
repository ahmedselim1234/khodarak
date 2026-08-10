import type { PriceBreakdown } from "@/lib/pricing/calculate";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-outline-variant/20 py-2">
      <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function sar(value: number) {
  return `${value.toFixed(2)} ر.س`;
}

// Presentational — renders the returned breakdown's lines plus the
// min-order/max-items compliance flags (FR-016).
export function PriceBreakdownCard({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <div className="bg-surface rounded-[20px] p-stack-md shadow-sm border border-outline-variant/30">
      <h3 className="font-headline-md text-headline-md text-primary font-bold mb-stack-sm">
        تفاصيل السعر
      </h3>
      <Line label="المجموع الفرعي" value={sar(breakdown.itemsSubtotal)} />
      <Line label="خصم التردد" value={`- ${sar(breakdown.frequencyDiscountAmount)}`} />
      <Line label="بعد الخصم" value={sar(breakdown.afterDiscount)} />
      <Line label="رسوم التوصيل" value={sar(breakdown.deliveryFee)} />
      <Line label="ضريبة القيمة المضافة" value={sar(breakdown.vatAmount)} />
      <div className="flex justify-between py-3">
        <span className="font-headline-md text-headline-md font-bold">الإجمالي لكل توصيلة</span>
        <span className="font-headline-md text-headline-md text-primary font-bold">
          {sar(breakdown.totalPerDelivery)}
        </span>
      </div>
      <p className="font-label-sm text-label-sm text-on-surface-variant mb-stack-sm">
        ≈ {sar(breakdown.estimatedMonthly)} شهرياً
      </p>

      {!breakdown.meetsMinimumOrderValue && (
        <p className="font-label-sm text-label-sm text-error">
          الطلب أقل من الحد الأدنى لقيمة الطلب
        </p>
      )}
      {!breakdown.withinMaxItemsPerBox && (
        <p className="font-label-sm text-label-sm text-error">
          عدد الأصناف يتجاوز الحد الأقصى للصندوق
        </p>
      )}
      {breakdown.droppedItems.length > 0 && (
        <p className="font-label-sm text-label-sm text-error">
          تم استبعاد {breakdown.droppedItems.length} منتج غير متوفر من الحساب
        </p>
      )}
    </div>
  );
}

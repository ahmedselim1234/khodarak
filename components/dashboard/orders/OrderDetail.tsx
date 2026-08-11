import type { PriceBreakdown } from "@/lib/pricing/calculate";
import { PriceBreakdownCard } from "@/components/pricing/PriceBreakdownCard";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export type OrderDetailData = {
  scheduledDate: string;
  deliveredAt: string | null;
  status: string;
  addressSnapshot: {
    label?: string;
    cityName?: string | null;
    district?: string;
    streetDetails?: string;
  };
  items: Array<{ productNameSnapshot: string; unitPriceSnapshot: number; quantity: number }>;
  priceBreakdown: PriceBreakdown;
};

// Server Component — the order's exact snapshotted address/items/price as
// generated (FR-017), never anything recomputed from current data.
export function OrderDetail({ order }: { order: OrderDetailData }) {
  return (
    <div className="flex flex-col gap-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-md border border-outline-variant/30">
        <p className="font-bold">
          {order.scheduledDate} — {STATUS_LABELS[order.status] ?? order.status}
        </p>
        {order.deliveredAt && (
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            تم التسليم: {order.deliveredAt}
          </p>
        )}
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
          {order.addressSnapshot.label} — {order.addressSnapshot.cityName}،{" "}
          {order.addressSnapshot.district}
        </p>
      </div>

      <div className="bg-surface rounded-[20px] p-stack-md border border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md font-bold mb-stack-sm">المنتجات</h3>
        <ul className="flex flex-col gap-1">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between font-label-sm text-label-sm">
              <span>{item.productNameSnapshot}</span>
              <span>
                {item.quantity} × {item.unitPriceSnapshot.toFixed(2)} ر.س
              </span>
            </li>
          ))}
        </ul>
      </div>

      <PriceBreakdownCard breakdown={order.priceBreakdown} />
    </div>
  );
}

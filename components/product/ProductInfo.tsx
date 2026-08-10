import type { MappedProduct } from "@/lib/products/mapProductRow";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

const UNIT_LABEL: Record<string, string> = { kg: "كجم", piece: "حبة" };
const CATEGORY_LABEL: Record<string, string> = { vegetables: "خضروات", fruits: "فواكه" };

// Server Component shell — name/price/unit, embeds QuantityStepper (US3).
export function ProductInfo({ product }: { product: MappedProduct }) {
  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-4">
          {CATEGORY_LABEL[product.category]}
        </span>
        <h1 className="font-display-lg text-display-lg font-extrabold text-primary mb-2">
          {product.nameAr}
        </h1>
        {!product.isAvailable && (
          <p className="font-label-sm text-label-sm text-error font-bold">غير متوفر حالياً</p>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-secondary font-display-lg text-display-lg font-bold">
          {product.price.toFixed(2)}
        </span>
        <span className="text-on-surface-variant font-body-md text-body-md mb-2">
          ريال / {UNIT_LABEL[product.unit]}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <label className="font-label-sm text-label-sm text-primary font-bold">
          الكمية المطلوبة
        </label>
        <QuantityStepper
          product={{
            id: product.id,
            nameAr: product.nameAr,
            price: product.price,
            unit: product.unit,
            imageUrl: product.imageUrl,
            minQty: product.minQty,
            maxQty: product.maxQty,
            isAvailable: product.isAvailable,
          }}
        />
      </div>
    </div>
  );
}

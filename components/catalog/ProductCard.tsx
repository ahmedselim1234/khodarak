import Link from "next/link";
import Image from "next/image";
import type { MappedProduct } from "@/lib/products/mapProductRow";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

const UNIT_LABEL: Record<string, string> = { kg: "كجم", piece: "حبة" };

// Server Component shell — image, name, price/unit, unavailable badge, plus
// the QuantityStepper leaf (US3) for adding/adjusting this product.
export function ProductCard({ product }: { product: MappedProduct }) {
  return (
    <div className="group relative bg-surface rounded-[20px] overflow-hidden product-card-shadow transition-all duration-300 flex flex-col h-full">
      <Link href={`/browse/${product.id}`} className="relative h-64 w-full bg-surface-container-low overflow-hidden block">
        <Image
          src={product.imageUrl}
          alt={product.nameAr}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!product.isAvailable && (
          <span className="absolute top-4 right-4 bg-error text-on-error px-3 py-1 rounded-full text-[12px] font-bold">
            غير متوفر
          </span>
        )}
      </Link>
      <div className="p-stack-md flex flex-col flex-grow">
        <Link href={`/browse/${product.id}`}>
          <h4 className="font-headline-md text-headline-md text-on-surface mb-1">
            {product.nameAr}
          </h4>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="font-headline-md text-headline-md text-primary">
              {product.price.toFixed(2)} ر.س
            </span>
            <span className="text-label-sm text-outline"> / {UNIT_LABEL[product.unit]}</span>
          </div>
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
    </div>
  );
}

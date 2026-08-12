import Link from "next/link";
import Image from "next/image";
import type { MappedProduct } from "@/lib/products/mapProductRow";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { formatPrice } from "@/lib/format";

const UNIT_LABEL: Record<string, string> = { kg: "كجم", piece: "حبة" };

// Server Component shell — image, name, price/unit, unavailable badge, plus
// the QuantityStepper leaf (US3) for adding/adjusting this product.
// The image is a square aspect box rather than a fixed 256px height, so the
// card works in the home page's 4-across grid and the catalog's 3-across one
// without two different card components.
export function ProductCard({
  product,
  priority = false,
}: {
  product: MappedProduct;
  priority?: boolean;
}) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-organic bg-surface product-card-shadow">
      <Link
        href={`/browse/${product.id}`}
        prefetch={false}
        className="relative block aspect-square w-full overflow-hidden bg-surface-container-low"
      >
        <Image
          src={product.imageUrl}
          alt={product.nameAr}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-slow ease-out-quart group-hover:scale-105"
        />
        {!product.isAvailable && (
          <span className="absolute top-3 end-3 rounded-full bg-error px-2.5 py-1 text-caption font-bold text-on-error">
            غير متوفر
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/browse/${product.id}`} prefetch={false}>
          <h3 className="text-h3 text-on-surface transition-colors duration-fast group-hover:text-primary">
            {product.nameAr}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-stack-md">
          <div className="min-w-0">
            <span className="block text-h3 tabular text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-caption text-on-surface-variant">
              / {UNIT_LABEL[product.unit] ?? product.unit}
            </span>
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

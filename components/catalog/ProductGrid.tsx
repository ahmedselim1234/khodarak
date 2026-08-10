import type { MappedProduct } from "@/lib/products/mapProductRow";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";

export function ProductGrid({ products }: { products: MappedProduct[] }) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

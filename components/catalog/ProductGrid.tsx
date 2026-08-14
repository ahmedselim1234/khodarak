import type { MappedProduct } from "@/lib/products/mapProductRow";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import { Reveal } from "@/components/ui/Reveal";

// Stagger is capped rather than `index * 60`: a full catalogue page is 24 cards,
// and an uncapped ramp would leave the last one blank for a second and a half,
// which reads as a slow page rather than as choreography.
const MAX_STAGGER_STEPS = 7;

export function ProductGrid({ products }: { products: MappedProduct[] }) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index, MAX_STAGGER_STEPS) * 60}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}

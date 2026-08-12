import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { MappedProduct } from "@/lib/products/mapProductRow";

// The home page's answer to "what am I actually buying?" — real rows from the
// catalog, each with a working add-to-box control, so a visitor can start
// filling a box without leaving the landing page.
export function FeaturedProducts({ products }: { products: MappedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-y border-outline-variant bg-surface-container-low py-stack-2xl">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-stack-md">
          <div className="max-w-xl">
            <p className="text-overline uppercase text-primary">طازج اليوم</p>
            <h2 className="mt-2 text-h1 text-on-background">اختر من محصول هذا الأسبوع</h2>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              أضف ما يعجبك مباشرة — يمكنك تعديل الصندوق بالكامل قبل تأكيد الاشتراك.
            </p>
          </div>
          <Link
            href="/browse"
            prefetch
            className="inline-flex items-center gap-2 text-label-sm font-semibold text-primary transition-opacity duration-fast hover:opacity-80"
          >
            عرض كل المنتجات
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-stack-xl grid grid-cols-2 gap-gutter lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

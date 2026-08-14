import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import type { MappedProduct } from "@/lib/products/mapProductRow";

// The home page's answer to "what am I actually buying?" — real rows from the
// catalog, each with a working add-to-box control, so a visitor can start
// filling a box without leaving the landing page.
export function FeaturedProducts({ products }: { products: MappedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-y border-outline-variant bg-surface-container-low py-stack-2xl">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-stack-md">
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
            className="group inline-flex items-center gap-2 text-label-sm font-semibold text-primary transition-opacity duration-fast hover:opacity-80"
          >
            عرض كل المنتجات
            {/* -translate-x-1 is leftward, which is forward in RTL. */}
            <ArrowLeft
              className="size-4 transition-transform duration-fast ease-out-quart group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <div className="mt-stack-xl grid grid-cols-2 gap-gutter lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 70}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

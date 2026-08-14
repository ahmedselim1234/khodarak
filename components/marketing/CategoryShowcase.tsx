import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { MappedProduct } from "@/lib/products/mapProductRow";

const categories = [
  {
    key: "vegetables" as const,
    title: "خضروات",
    body: "ورقيات، جذور، وطماطم تُقطف صباح التوصيل.",
    href: "/browse?category=vegetables",
    // Opaque stop rather than /85, plus an accent mid-stop — the scrim now
    // reads as brand light falling across the photo instead of a grey wash.
    scrim: "from-primary via-primary/40 to-transparent",
    // The pair enters from opposite edges. `slide-in-start` is the RTL-aware
    // token, so this mirrors correctly without a physical translate.
    enter: "slide-in-start" as const,
  },
  {
    key: "fruits" as const,
    title: "فواكه",
    body: "موسمية بالكامل — ما نبيع فاكهة خارج موسمها.",
    href: "/browse?category=fruits",
    scrim: "from-secondary via-secondary/40 to-transparent",
    enter: "slide-in-end" as const,
  },
];

export function CategoryShowcase({ products }: { products: MappedProduct[] }) {
  return (
    <section className="py-stack-2xl">
      <Container>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {categories.map((category) => {
            const cover = products.find((product) => product.category === category.key);

            return (
              <Reveal key={category.key} animation={category.enter}>
                <Link
                  href={category.href}
                  prefetch
                  className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-organic bg-surface-container p-6 shadow-sm transition-[transform,box-shadow] duration-slow ease-out-expo hover:-translate-y-1 hover:shadow-lg"
                >
                  {cover && (
                    <Image
                      src={cover.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-slow ease-out-quart group-hover:scale-105"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-slow group-hover:opacity-90 ${category.scrim}`}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h3 className="text-h1 text-white">{category.title}</h3>
                    <p className="mt-1 max-w-xs text-small text-white/90">
                      {category.body}
                    </p>
                    <span className="mt-stack-sm inline-flex items-center gap-2 text-label-sm text-white">
                      تصفّح القسم
                      {/* -translate-x-1 moves the arrow left, which is FORWARD
                          in RTL — matching the arrow's own direction. Correct
                          as written; do not "fix" it to a positive value. */}
                      <ArrowLeft
                        className="size-4 transition-transform duration-fast ease-out-quart group-hover:-translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

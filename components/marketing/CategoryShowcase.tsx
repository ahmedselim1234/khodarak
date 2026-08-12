import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { MappedProduct } from "@/lib/products/mapProductRow";

const categories = [
  {
    key: "vegetables" as const,
    title: "خضروات",
    body: "ورقيات، جذور، وطماطم تُقطف صباح التوصيل.",
    href: "/browse?category=vegetables",
    accent: "from-primary/85",
  },
  {
    key: "fruits" as const,
    title: "فواكه",
    body: "موسمية بالكامل — ما نبيع فاكهة خارج موسمها.",
    href: "/browse?category=fruits",
    accent: "from-secondary/85",
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
              <Link
                key={category.key}
                href={category.href}
                prefetch
                className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-organic bg-surface-container p-6 shadow-sm transition-shadow duration-slow hover:shadow-lg"
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
                  className={`absolute inset-0 bg-gradient-to-t ${category.accent} to-transparent`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <h3 className="text-h1 text-white">{category.title}</h3>
                  <p className="mt-1 max-w-xs text-small text-white/85">{category.body}</p>
                  <span className="mt-stack-sm inline-flex items-center gap-2 text-label-sm text-white">
                    تصفّح القسم
                    <ArrowLeft
                      className="size-4 transition-transform duration-fast group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

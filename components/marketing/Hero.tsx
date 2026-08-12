import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Leaf, ShieldCheck, Sprout, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { MappedProduct } from "@/lib/products/mapProductRow";

const proofPoints = [
  { Icon: Truck, label: "توصيل مجاني فوق ١٥٠ ر.س" },
  { Icon: ShieldCheck, label: "جودة مضمونة" },
  { Icon: Leaf, label: "تُقطف كل صباح" },
];

// The image uses a real catalog photo when the catalog has any — a home
// page whose "products" are stock illustrations is the fastest way to look
// like a template. With an empty catalog it degrades to a plain gradient
// panel rather than rendering a broken image frame.
export function Hero({ showcase = [] }: { showcase?: MappedProduct[] }) {
  const [heroTile] = showcase;

  return (
    <section className="border-b border-outline-variant bg-primary">
      <Container>
        <div className="grid grid-cols-1 items-center gap-stack-xl py-stack-2xl lg:grid-cols-2 lg:py-stack-3xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-on-primary/10 px-3 py-1.5 text-caption font-semibold text-on-primary">
              <Leaf className="size-3.5" aria-hidden="true" />
              أهلاً بك في خضارك
            </span>

            <h1 className="mt-stack-md text-[36px] font-bold leading-[1.15] tracking-tight text-on-primary sm:text-[46px]">
              طازج من المزرعة إلى باب بيتك
            </h1>

            <p className="mt-stack-md max-w-lg text-body-lg text-on-primary/85">
              اشترك في صندوق خضروات وفواكه طازجة، أسبوعياً أو شهرياً. أنت تختار
              المحتويات والموعد، ونحن نتكفّل بالباقي.
            </p>

            <div className="mt-stack-lg flex flex-wrap items-center gap-stack-sm">
              <Link
                href="/subscription"
                prefetch
                className="inline-flex h-[52px] items-center gap-2 rounded-organic bg-secondary px-7 text-body-md font-semibold text-on-secondary shadow-sm transition-colors duration-fast hover:bg-secondary/90"
              >
                ابدأ اشتراكك الآن
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/browse"
                prefetch
                className="inline-flex h-[52px] items-center rounded-organic border border-on-primary/30 px-7 text-body-md font-semibold text-on-primary transition-colors duration-fast hover:bg-on-primary/10"
              >
                تصفّح المنتجات
              </Link>
            </div>

            <ul className="mt-stack-lg flex flex-wrap gap-stack-md">
              {proofPoints.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-small text-on-primary/85"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block" aria-hidden="true">
            {heroTile ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-organic shadow-lg">
                <Image
                  src={heroTile.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 0px, 480px"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-organic bg-on-primary/10">
                <Sprout className="size-20 text-on-primary/70" />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

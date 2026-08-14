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
    // `overflow-hidden` is not optional: the decorative blobs below are
    // absolutely positioned past the section's edges, and without the clip they
    // create horizontal scroll — which in RTL surfaces as a jump in scroll
    // position on load, not just a stray scrollbar.
    <section className="relative overflow-hidden border-b border-outline-variant bg-brand-band animate-gradient-pan">
      {/* Ambient light. Purely decorative and non-interactive; the reduced-motion
          block in globals.css stops the drift outright. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -end-24 size-[28rem] rounded-full bg-accent/25 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -start-20 size-[24rem] rounded-full bg-secondary-bright/25 blur-3xl animate-float [animation-delay:2.5s]"
      />

      <Container>
        <div className="relative grid grid-cols-1 items-center gap-stack-xl py-stack-2xl lg:grid-cols-2 lg:py-stack-3xl">
          <div className="max-w-2xl">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-on-primary/15 px-3 py-1.5 text-caption font-semibold text-on-primary">
              <Leaf className="size-3.5" aria-hidden="true" />
              أهلاً بك في خضارك
            </span>

            {/* Deliberately NOT animated. An element at opacity 0 is not a valid
                LCP candidate, and this headline is the LCP element on mobile —
                fading it in would add its whole duration to the metric. */}
            <h1 className="mt-stack-md text-[36px] font-bold leading-[1.15] tracking-tight text-on-primary sm:text-[46px]">
              {/*
                The one place a `*-bright` token is allowed as a foreground.
                #FFC94D on the #11803D band is 3.28:1 — which clears AA for
                LARGE text (3:1) and nothing else. It is legal here only because
                this is 36px+ bold. Do not reuse this pairing at body size.
              */}
              <span className="text-accent-bright">طازج</span> من المزرعة إلى باب
              بيتك
            </h1>

            {/* Solid, not `/85`: white at 85% over the green band is 4.09, which
                fails AA for body copy. De-emphasis here comes from size, not
                alpha. */}
            <p className="mt-stack-md max-w-lg animate-fade-up text-body-lg text-on-primary [animation-delay:90ms]">
              اشترك في صندوق خضروات وفواكه طازجة، أسبوعياً أو شهرياً. أنت تختار
              المحتويات والموعد، ونحن نتكفّل بالباقي.
            </p>

            <div className="mt-stack-lg flex animate-fade-up flex-wrap items-center gap-stack-sm [animation-delay:180ms]">
              <Link
                href="/subscription"
                prefetch
                className="inline-flex h-[52px] items-center gap-2 rounded-organic bg-secondary px-7 text-body-md font-semibold text-on-secondary shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-out-quart hover:shadow-glow-secondary active:scale-[0.98] motion-reduce:active:scale-100"
              >
                ابدأ اشتراكك الآن
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/browse"
                prefetch
                className="inline-flex h-[52px] items-center rounded-organic border border-on-primary/40 px-7 text-body-md font-semibold text-on-primary transition-[background-color,transform] duration-fast ease-out-quart hover:bg-on-primary/15 active:scale-[0.98] motion-reduce:active:scale-100"
              >
                تصفّح المنتجات
              </Link>
            </div>

            <ul className="mt-stack-lg flex animate-fade-up flex-wrap gap-stack-md [animation-delay:270ms]">
              {proofPoints.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-small text-on-primary"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block" aria-hidden="true">
            {heroTile ? (
              // Not wrapped in a reveal: this is `priority` and the desktop LCP
              // element, so it must paint at full opacity immediately.
              <div className="group relative aspect-[4/3] overflow-hidden rounded-organic shadow-xl transition-shadow duration-slow ease-out-expo hover:shadow-glow-accent">
                <Image
                  src={heroTile.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 0px, 480px"
                  priority
                  className="object-cover transition-transform duration-slow ease-out-quart group-hover:scale-[1.04]"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-organic bg-on-primary/10">
                <Sprout className="size-20 text-on-primary/70 animate-float" />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

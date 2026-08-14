import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <Reveal className="relative overflow-hidden rounded-organic bg-brand-band animate-gradient-pan px-6 py-stack-2xl text-center md:px-stack-2xl">
          <div
            className="pointer-events-none absolute -top-24 -end-16 size-72 rounded-full bg-accent/20 blur-3xl animate-float"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -start-10 size-72 rounded-full bg-secondary-bright/25 blur-3xl animate-float [animation-delay:3s]"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-display-lg-mobile text-on-primary md:text-display-lg">
              جرّب أول صندوق هذا الأسبوع
            </h2>
            {/* Solid rather than `/85` — 85% white on the green band is 4.09 and
                fails AA at this size. */}
            <p className="mt-stack-md text-body-lg text-on-primary">
              ابنِ صندوقك في أقل من دقيقتين. ولو ما عجبك، أوقف الاشتراك بضغطة —
              بدون أسئلة ولا رسوم.
            </p>
            <div className="mt-stack-lg flex flex-wrap items-center justify-center gap-stack-sm">
              <Link
                href="/subscription"
                prefetch
                className="inline-flex h-[52px] items-center gap-2 rounded-organic bg-surface px-7 text-body-md font-semibold text-primary shadow-md transition-[box-shadow,transform] duration-fast ease-out-quart hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100"
              >
                ابدأ اشتراكك الآن
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing-preview"
                prefetch
                className="inline-flex h-[52px] items-center rounded-organic border border-on-primary/40 px-7 text-body-md font-semibold text-on-primary transition-[background-color,transform] duration-fast ease-out-quart hover:bg-on-primary/15 active:scale-[0.98] motion-reduce:active:scale-100"
              >
                احسب سعر صندوقك
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

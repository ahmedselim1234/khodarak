import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function FinalCta() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <div className="relative overflow-hidden rounded-organic bg-primary px-6 py-stack-2xl text-center md:px-stack-2xl">
          <div
            className="pointer-events-none absolute -top-24 -end-16 size-72 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -start-10 size-72 rounded-full bg-secondary/25 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-display-lg-mobile text-on-primary md:text-display-lg">
              جرّب أول صندوق هذا الأسبوع
            </h2>
            <p className="mt-stack-md text-body-lg text-on-primary/85">
              ابنِ صندوقك في أقل من دقيقتين. ولو ما عجبك، أوقف الاشتراك بضغطة —
              بدون أسئلة ولا رسوم.
            </p>
            <div className="mt-stack-lg flex flex-wrap items-center justify-center gap-stack-sm">
              <Link
                href="/subscription"
                prefetch
                className="inline-flex h-[52px] items-center gap-2 rounded-organic bg-surface px-7 text-body-md font-semibold text-primary shadow-md transition-transform duration-fast hover:shadow-lg"
              >
                ابدأ اشتراكك الآن
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing-preview"
                prefetch
                className="inline-flex h-[52px] items-center rounded-organic border border-on-primary/35 px-7 text-body-md font-semibold text-on-primary transition-colors duration-fast hover:bg-on-primary/10"
              >
                احسب سعر صندوقك
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

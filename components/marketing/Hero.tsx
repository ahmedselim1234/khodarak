import Link from "next/link";
import { ArrowLeft, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const proofPoints = [
  { Icon: Truck, label: "توصيل مجاني للطلبات فوق ١٥٠ ر.س" },
  { Icon: ShieldCheck, label: "جودة مضمونة أو نعيد لك المبلغ" },
  { Icon: Leaf, label: "من مزارع محلية، تُقطف كل صباح" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant bg-surface-container-low">
      {/* Soft organic wash behind the headline — decorative only. */}
      <div
        className="pointer-events-none absolute -top-32 -start-24 size-[420px] rounded-full bg-primary-container/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -end-20 size-[360px] rounded-full bg-secondary-container/50 blur-3xl"
        aria-hidden="true"
      />

      <Container>
        <div className="relative py-stack-2xl md:py-stack-3xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1.5 text-caption font-semibold text-on-primary-container">
              <Leaf className="size-3.5" aria-hidden="true" />
              أهلاً بك في خضارك
            </span>

            <h1 className="mt-stack-md text-display-lg-mobile text-on-background md:text-display-lg">
              طازج من المزرعة
              <br />
              إلى باب بيتك
            </h1>

            <p className="mt-stack-md max-w-lg text-body-lg text-on-surface-variant">
              اشترك في صندوق خضروات وفواكه طازجة، أسبوعياً أو شهرياً. أنت تختار
              المحتويات والموعد، ونحن نتكفّل بالباقي.
            </p>

            <div className="mt-stack-lg flex flex-wrap items-center gap-stack-sm">
              <Link
                href="/subscription"
                className="inline-flex h-[52px] items-center gap-2 rounded-organic bg-primary px-7 text-body-md font-semibold text-on-primary shadow-sm transition-[background-color,color,box-shadow] duration-fast ease-out-quart hover:bg-primary-container hover:text-on-primary-container hover:shadow-md"
              >
                ابدأ اشتراكك الآن
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/browse"
                className="inline-flex h-[52px] items-center rounded-organic border border-outline-variant bg-surface px-7 text-body-md font-semibold text-on-surface transition-colors duration-fast hover:border-primary hover:text-primary"
              >
                تصفّح المنتجات
              </Link>
            </div>

            <ul className="mt-stack-xl flex flex-col gap-2.5">
              {proofPoints.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-small text-on-surface-variant"
                >
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

// Marketing copy only — the real frequency options and prices come from the
// `settings` row and are shown in the builder at /subscription.
const plans = [
  {
    name: "أسبوعي",
    tagline: "للعائلات التي تطبخ يومياً",
    price: "من ١٢٠ ر.س",
    period: "لكل صندوق",
    features: ["توصيل كل أسبوع", "تعديل المحتويات قبل كل شحنة", "إيقاف مؤقت متى شئت"],
    featured: true,
  },
  {
    name: "نصف شهري",
    tagline: "الأكثر توازناً",
    price: "من ١٩٠ ر.س",
    period: "لكل صندوق",
    features: ["توصيل كل أسبوعين", "صندوق أكبر", "تعديل المحتويات قبل كل شحنة"],
    featured: false,
  },
  {
    name: "شهري",
    tagline: "للاستهلاك الخفيف",
    price: "من ٢٤٠ ر.س",
    period: "لكل صندوق",
    features: ["توصيل مرة كل شهر", "أفضل سعر للكيلو", "مرونة كاملة في الإلغاء"],
    featured: false,
  },
];

export function Plans() {
  return (
    <section className="border-y border-outline-variant bg-surface-container-low py-stack-2xl">
      <Container>
        <div className="max-w-xl">
          <p className="text-overline uppercase text-primary">الخطط</p>
          <h2 className="mt-2 text-h1 text-on-background">اختر ما يناسب مطبخك</h2>
          <p className="mt-stack-sm text-body-md text-on-surface-variant">
            كل الخطط قابلة للتعديل أو الإيقاف في أي وقت، بدون رسوم إلغاء.
          </p>
        </div>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-organic border bg-surface p-6 ${
                plan.featured
                  ? "border-primary shadow-lg"
                  : "border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-h3 text-on-surface">{plan.name}</h3>
                {plan.featured && <Badge tone="brand">الأكثر شيوعاً</Badge>}
              </div>

              <p className="mt-1 text-small text-on-surface-variant">
                {plan.tagline}
              </p>

              <p className="mt-stack-md text-h1 text-primary">{plan.price}</p>
              <p className="text-caption text-on-surface-variant">{plan.period}</p>

              <ul className="mt-stack-md flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-small">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-on-surface-variant">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/subscription"
                className={`mt-stack-lg inline-flex h-11 items-center justify-center rounded-lg px-5 text-label-sm font-semibold transition-colors duration-fast ${
                  plan.featured
                    ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
                    : "border border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                }`}
              >
                ابدأ بهذه الخطة
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

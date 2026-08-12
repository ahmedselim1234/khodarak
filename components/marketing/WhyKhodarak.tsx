import { Boxes, HandCoins, MapPinned, Recycle, Sparkles, Timer } from "lucide-react";
import { Container } from "@/components/ui/Container";

const reasons = [
  {
    Icon: Sparkles,
    title: "صندوق على مقاسك",
    body: "لا صناديق جاهزة مفروضة — تختار كل صنف وكل كمية بنفسك.",
  },
  {
    Icon: Timer,
    title: "أقل من ١٢ ساعة",
    body: "من الحصاد إلى باب بيتك، فتصل الخضار بعمر رفّ أطول.",
  },
  {
    Icon: HandCoins,
    title: "سعر واضح",
    body: "تشوف تفصيل السعر والضريبة والتوصيل قبل ما تدفع ريال.",
  },
  {
    Icon: MapPinned,
    title: "تغطية تتوسّع",
    body: "الرياض وجدة والدمام، ومدن جديدة كل شهر.",
  },
  {
    Icon: Recycle,
    title: "تغليف أقل",
    body: "صناديق قابلة لإعادة الاستخدام نستلمها مع التوصيلة التالية.",
  },
  {
    Icon: Boxes,
    title: "تحكم كامل",
    body: "عدّل المحتويات، أجّل توصيلة، أو أوقف الاشتراك من لوحة تحكمك.",
  },
];

export function WhyKhodarak() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <div className="max-w-xl">
          <p className="text-overline uppercase text-primary">لماذا خضارك</p>
          <h2 className="mt-2 text-h1 text-on-background">فرق تحسّه من أول صندوق</h2>
        </div>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-organic border border-outline-variant bg-surface p-6 transition-shadow duration-slow hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-stack-md text-h3 text-on-surface">{title}</h3>
              <p className="mt-1.5 text-small text-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

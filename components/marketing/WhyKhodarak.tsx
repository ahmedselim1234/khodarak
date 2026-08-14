import { Boxes, HandCoins, MapPinned, Recycle, Sparkles, Timer } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

// Cycled so a 2×3 grid does not read as six identical tomato chips.
const chipTones = [
  "bg-primary-container text-on-primary-container",
  "bg-accent-container text-on-accent-container",
  "bg-secondary-container text-on-secondary-container",
];

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
        <Reveal className="max-w-xl">
          <p className="text-overline uppercase text-primary">لماذا خضارك</p>
          <h2 className="mt-2 text-h1 text-on-background">فرق تحسّه من أول صندوق</h2>
        </Reveal>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ Icon, title, body }, index) => (
            <Reveal
              key={title}
              delay={(index % 3) * 90}
              className="group rounded-organic border border-outline-variant bg-surface p-6 transition-[transform,box-shadow,border-color] duration-slow ease-out-expo hover:-translate-y-1 hover:border-primary-container hover:shadow-lg"
            >
              <div
                className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-slow ease-out-expo group-hover:scale-110 ${chipTones[index % chipTones.length]}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-stack-md text-h3 text-on-surface">{title}</h3>
              <p className="mt-1.5 text-small text-on-surface-variant">{body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

import { CalendarCheck, PackageCheck, Salad } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    Icon: Salad,
    title: "اختر محتويات صندوقك",
    body: "أضف ما تحتاجه من الخضروات والفواكه، وحدّد الكمية لكل صنف.",
    chip: "bg-primary-container text-on-primary-container",
  },
  {
    Icon: CalendarCheck,
    title: "حدّد التكرار والموعد",
    body: "أسبوعي أو نصف شهري أو شهري، مع اختيار يوم التوصيل الذي يناسبك.",
    chip: "bg-accent-container text-on-accent-container",
  },
  {
    Icon: PackageCheck,
    title: "استلم عند بابك",
    body: "يصلك الصندوق في موعده. عدّل أو أوقف اشتراكك متى شئت.",
    chip: "bg-secondary-container text-on-secondary-container",
  },
];

export function HowItWorks() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-overline uppercase text-primary">كيف يعمل</p>
          <h2 className="mt-2 text-h1 text-on-background">ثلاث خطوات فقط</h2>
        </Reveal>

        <ol className="mt-stack-xl grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {steps.map(({ Icon, title, body, chip }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 90}
              className="group rounded-organic border border-outline-variant bg-surface p-6 transition-[transform,box-shadow,border-color] duration-slow ease-out-expo hover:-translate-y-1 hover:border-primary-container hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-slow ease-out-expo group-hover:scale-110 ${chip}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-overline tabular text-on-surface-variant">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-stack-md text-h3 text-on-surface">{title}</h3>
              <p className="mt-1.5 text-small text-on-surface-variant">{body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

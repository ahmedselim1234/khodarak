import { CalendarCheck, PackageCheck, Salad } from "lucide-react";
import { Container } from "@/components/ui/Container";

const steps = [
  {
    Icon: Salad,
    title: "اختر محتويات صندوقك",
    body: "أضف ما تحتاجه من الخضروات والفواكه، وحدّد الكمية لكل صنف.",
  },
  {
    Icon: CalendarCheck,
    title: "حدّد التكرار والموعد",
    body: "أسبوعي أو نصف شهري أو شهري، مع اختيار يوم التوصيل الذي يناسبك.",
  },
  {
    Icon: PackageCheck,
    title: "استلم عند بابك",
    body: "يصلك الصندوق في موعده. عدّل أو أوقف اشتراكك متى شئت.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <div className="max-w-xl">
          <p className="text-overline uppercase text-primary">كيف يعمل</p>
          <h2 className="mt-2 text-h1 text-on-background">ثلاث خطوات فقط</h2>
        </div>

        <ol className="mt-stack-xl grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {steps.map(({ Icon, title, body }, index) => (
            <li
              key={title}
              className="rounded-organic border border-outline-variant bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-overline tabular text-on-surface-variant">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-stack-md text-h3 text-on-surface">{title}</h3>
              <p className="mt-1.5 text-small text-on-surface-variant">{body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

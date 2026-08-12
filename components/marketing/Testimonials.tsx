import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";

const testimonials = [
  {
    quote:
      "أول مرة أحصل على خضار بهذه الطزاجة بدون ما أطلع من البيت. الصندوق الأسبوعي صار جزء من روتين العائلة.",
    name: "أم عبدالله",
    city: "الرياض",
  },
  {
    quote:
      "أعجبني إني أقدر أعدّل محتويات الصندوق قبل كل توصيلة. ما في هدر، وكل شي نستهلكه فعلاً.",
    name: "خالد الأحمدي",
    city: "جدة",
  },
  {
    quote:
      "أوقفت الاشتراك أسبوعين وقت السفر ورجّعته بضغطة زر. الخدمة مرنة أكثر مما توقعت.",
    name: "نورة العتيبي",
    city: "الدمام",
  },
];

export function Testimonials() {
  return (
    <section className="py-stack-2xl">
      <Container>
        <div className="max-w-xl">
          <p className="text-overline uppercase text-primary">آراء المشتركين</p>
          <h2 className="mt-2 text-h1 text-on-background">ماذا يقول عملاؤنا</h2>
        </div>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-organic border border-outline-variant bg-surface p-6"
            >
              <Quote
                className="size-5 text-primary-fixed-dim"
                aria-hidden="true"
              />
              <blockquote className="mt-stack-sm grow text-small leading-relaxed text-on-surface">
                {item.quote}
              </blockquote>
              <figcaption className="mt-stack-md border-t border-outline-variant pt-stack-sm">
                <p className="text-label-sm text-on-surface">{item.name}</p>
                <p className="text-caption text-on-surface-variant">{item.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

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
        <Reveal className="max-w-xl">
          <p className="text-overline uppercase text-primary">آراء المشتركين</p>
          <h2 className="mt-2 text-h1 text-on-background">ماذا يقول عملاؤنا</h2>
        </Reveal>

        <div className="mt-stack-xl grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              as="figure"
              key={item.name}
              delay={index * 90}
              className="group flex flex-col rounded-organic border border-outline-variant bg-surface p-6 transition-[transform,box-shadow,border-color] duration-slow ease-out-expo hover:-translate-y-1 hover:border-primary-container hover:shadow-lg"
            >
              <Quote
                className="size-5 text-primary-fixed-dim transition-colors duration-slow group-hover:text-primary"
                aria-hidden="true"
              />
              <blockquote className="mt-stack-sm grow text-small leading-relaxed text-on-surface">
                {item.quote}
              </blockquote>
              <figcaption className="mt-stack-md border-t border-outline-variant pt-stack-sm">
                <p className="text-label-sm text-on-surface">{item.name}</p>
                <p className="text-caption text-on-surface-variant">{item.city}</p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

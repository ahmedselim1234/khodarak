import { BadgeCheck, CalendarX2, CreditCard, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

// The chip tint cycles rather than repeating one green four times — it is what
// stops the strip reading as a single grey block of icons.
const items = [
  {
    Icon: Truck,
    title: "توصيل في موعده",
    body: "تختار اليوم والفترة، ونلتزم بها.",
    chip: "bg-primary-container text-on-primary-container",
  },
  {
    Icon: BadgeCheck,
    title: "طازج ومضمون",
    body: "لم يعجبك صنف؟ نستبدله أو نرجّع قيمته.",
    chip: "bg-accent-container text-on-accent-container",
  },
  {
    Icon: CalendarX2,
    title: "أوقف متى شئت",
    body: "إيقاف مؤقت أو إلغاء بضغطة، بدون رسوم.",
    chip: "bg-secondary-container text-on-secondary-container",
  },
  {
    Icon: CreditCard,
    title: "دفع آمن",
    body: "مدى وApple Pay والبطاقات عبر Moyasar.",
    chip: "bg-info-container text-on-info-container",
  },
];

function TrustItem({ Icon, title, body, chip }: (typeof items)[number]) {
  return (
    <div className="flex w-64 shrink-0 items-start gap-3 sm:w-auto sm:shrink">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-slow ease-out-expo group-hover/item:scale-110 ${chip}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-label-sm text-on-surface">{title}</p>
        <p className="mt-0.5 text-caption text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

export function TrustStrip() {
  return (
    <section className="border-b border-outline-variant bg-surface">
      {/*
        Below `sm` these four items would stack into a tall column that pushes
        the rest of the page down, so on narrow screens the strip becomes a
        marquee instead. The track is rendered twice and shifted by exactly 50%,
        which is what makes the loop seamless; the duplicate is aria-hidden so
        assistive tech reads each item once.
      */}
      <div className="overflow-hidden py-stack-lg sm:hidden">
        {/* Spacing is a per-item `pe-stack-md`, deliberately not a flex `gap`:
            with a gap, the track's two halves are separated by one extra gap
            that the 50% shift does not account for, and the loop visibly jumps
            each cycle. Padding folds the spacing into the item width, so the
            two halves are exactly equal. */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {items.map((item) => (
            <div key={item.title} className="pe-stack-md">
              <TrustItem {...item} />
            </div>
          ))}
          {items.map((item) => (
            <div key={`${item.title}-dup`} className="pe-stack-md" aria-hidden="true">
              <TrustItem {...item} />
            </div>
          ))}
        </div>
      </div>

      <Container>
        <ul className="hidden gap-stack-md py-stack-lg sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              animation="slide-in-start"
              delay={index * 80}
              className="group/item"
            >
              <TrustItem {...item} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

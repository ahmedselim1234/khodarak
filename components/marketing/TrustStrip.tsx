import { BadgeCheck, CalendarX2, CreditCard, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const items = [
  { Icon: Truck, title: "توصيل في موعده", body: "تختار اليوم والفترة، ونلتزم بها." },
  { Icon: BadgeCheck, title: "طازج ومضمون", body: "لم يعجبك صنف؟ نستبدله أو نرجّع قيمته." },
  { Icon: CalendarX2, title: "أوقف متى شئت", body: "إيقاف مؤقت أو إلغاء بضغطة، بدون رسوم." },
  { Icon: CreditCard, title: "دفع آمن", body: "مدى وApple Pay والبطاقات عبر Moyasar." },
];

export function TrustStrip() {
  return (
    <section className="border-b border-outline-variant bg-surface">
      <Container>
        <ul className="grid grid-cols-1 gap-stack-md py-stack-lg sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-label-sm text-on-surface">{title}</p>
                <p className="mt-0.5 text-caption text-on-surface-variant">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

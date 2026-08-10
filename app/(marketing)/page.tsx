import Link from "next/link";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const trustBadges = [
  { icon: "local_shipping", label: "توصيل سريع وموثوق" },
  { icon: "event_busy", label: "جدولة مرنة لاشتراكك" },
  { icon: "verified_user", label: "جودة مضمونة من المزرعة" },
];

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main>
        <section className="relative bg-primary-container/10 py-stack-lg">
          <Container>
            <div className="flex flex-col items-start gap-stack-md text-right max-w-2xl">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full font-label-sm text-label-sm">
                أهلاً بك في خضارك
              </span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background">
                طازج من المزرعة إلى باب بيتك
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                اشترك في صندوق خضروات وفواكه طازجة، أسبوعياً أو شهرياً، ويصلك
                باب بيتك دون عناء.
              </p>
              <Link
                href="/subscription"
                className="bg-primary text-on-primary px-10 py-5 rounded-organic font-headline-md text-headline-md organic-shadow hover:scale-105 active:scale-95 transition-all"
              >
                ابدأ اشتراكك الآن
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-stack-lg">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
              {trustBadges.map((badge) => (
                <Card key={badge.icon} className="text-center">
                  <span
                    className="material-symbols-outlined text-primary text-5xl mb-stack-sm"
                    aria-hidden
                  >
                    {badge.icon}
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {badge.label}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

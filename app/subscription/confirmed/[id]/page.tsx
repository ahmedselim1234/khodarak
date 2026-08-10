import { notFound } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { TIME_SLOTS } from "@/lib/subscription/timeSlots";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

// /subscription/confirmed/[id] — the "simple confirmation page" from
// Clarifications (2026-08-10): a real, dedicated page stating the box is
// saved and payment/activation is coming soon — NOT the design mockup's
// post-payment success screen, which is reserved for Phase 5. Owner-scoped
// fetch (RLS-backed), never trusts anything held in client state from
// before the request (Constitution Principle I/II).
export default async function SubscriptionConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, frequency, status, next_delivery_date, delivery_time_slot, price_breakdown")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    notFound();
  }

  const breakdown = subscription.price_breakdown as PriceBreakdown;
  const timeSlot = TIME_SLOTS.find((slot) => slot.id === subscription.delivery_time_slot);

  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg max-w-xl mx-auto flex flex-col gap-stack-md text-center">
            <span className="material-symbols-outlined text-primary text-6xl mx-auto" aria-hidden>
              task_alt
            </span>
            <h1 className="font-headline-md text-headline-md text-on-background font-bold">
              تم حفظ صندوقك بنجاح
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              اشتراكك الآن بانتظار الدفع والتفعيل — سنخبرك عندما تصبح هذه الخطوة متاحة.
            </p>

            <Card className="text-right">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">التردد</span>
                  <span className="font-bold">{FREQUENCY_LABELS[subscription.frequency]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">أول توصيل</span>
                  <span className="font-bold">{subscription.next_delivery_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">وقت التوصيل</span>
                  <span className="font-bold">{timeSlot?.label ?? subscription.delivery_time_slot}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant/30">
                  <span className="font-bold">الإجمالي لكل توصيلة</span>
                  <span className="font-bold text-primary">
                    {breakdown.totalPerDelivery.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </Card>

            <Link href="/browse" className="text-primary font-bold hover:underline">
              العودة إلى المتجر
            </Link>
          </div>
        </Container>
      </main>
    </>
  );
}

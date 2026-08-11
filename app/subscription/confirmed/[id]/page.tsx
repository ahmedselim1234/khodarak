import { notFound } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { TIME_SLOTS } from "@/lib/subscription/timeSlots";
import type { PriceBreakdown } from "@/lib/pricing/calculate";
import { PaymentSection } from "@/components/payment/PaymentSection";
import { isThrottled } from "@/lib/payments/retryThrottle";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

const STATUS_LABELS: Record<string, string> = {
  paused: "موقوف مؤقتاً",
  cancelled: "ملغى",
};

const THROTTLE_OPTIONS = { maxAttempts: 5, windowMinutes: 15 };

// /subscription/confirmed/[id] — status-aware (Phase 5). `pending_payment`
// renders the real payment step (PaymentSection); `active` renders the real
// success confirmation (design/successfull-order.html), replacing Phase 4's
// placeholder "coming soon" copy entirely. Owner-scoped fetch (RLS-backed),
// never trusts anything held in client state from before the request
// (Constitution Principle I/II).
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

  if (subscription.status === "pending_payment") {
    const [{ data: savedMethods }, { data: recentFailures }] = await Promise.all([
      supabase
        .from("payment_methods")
        .select("id, brand, last_four, exp_month, exp_year")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("is_default", { ascending: false }),
      supabase
        .from("payments")
        .select("created_at, failure_reason")
        .eq("subscription_id", id)
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(THROTTLE_OPTIONS.maxAttempts),
    ]);

    const throttled = isThrottled(
      (recentFailures ?? []).map((row) => row.created_at),
      new Date(),
      THROTTLE_OPTIONS
    );

    return (
      <>
        <TopNav />
        <main>
          <Container>
            <div className="py-stack-lg max-w-xl mx-auto flex flex-col gap-stack-md">
              <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
                إتمام الدفع لاشتراكك
              </h1>
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
                    <span className="font-bold">
                      {timeSlot?.label ?? subscription.delivery_time_slot}
                    </span>
                  </div>
                </div>
              </Card>
              <PaymentSection
                subscriptionId={subscription.id}
                totalPerDelivery={breakdown.totalPerDelivery}
                savedMethods={(savedMethods ?? []).map((method) => ({
                  id: method.id,
                  brand: method.brand,
                  lastFour: method.last_four,
                  expMonth: method.exp_month,
                  expYear: method.exp_year,
                }))}
                recentFailureReason={recentFailures?.[0]?.failure_reason ?? null}
                throttled={throttled}
              />
            </div>
          </Container>
        </main>
      </>
    );
  }

  if (subscription.status === "active") {
    return (
      <>
        <TopNav />
        <main>
          <Container>
            <div className="py-stack-lg max-w-xl mx-auto flex flex-col gap-stack-md text-center">
              <span className="material-symbols-outlined text-primary text-6xl mx-auto" aria-hidden>
                check_circle
              </span>
              <h1 className="font-headline-md text-headline-md text-on-background font-bold">
                تم الدفع وتفعيل اشتراكك بنجاح
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                سيصلك أول طلب في الموعد المحدد — يمكنك متابعة تفاصيل اشتراكك من لوحة التحكم.
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
                    <span className="font-bold">
                      {timeSlot?.label ?? subscription.delivery_time_slot}
                    </span>
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

  // paused/cancelled: fall back to a translated status display rather than
  // a broken page or a raw English enum value.
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg max-w-xl mx-auto text-center flex flex-col gap-stack-sm">
            <p className="font-body-md text-body-md text-on-surface-variant">
              حالة الاشتراك: {STATUS_LABELS[subscription.status] ?? subscription.status}
            </p>
            <Link href="/dashboard" className="text-primary font-bold hover:underline">
              الذهاب إلى لوحة التحكم
            </Link>
          </div>
        </Container>
      </main>
    </>
  );
}

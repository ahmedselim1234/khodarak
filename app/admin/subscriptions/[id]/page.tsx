import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { SubscriptionDetailView } from "@/components/admin/subscriptions/SubscriptionDetailView";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

// /admin/subscriptions/[id] — new this phase (US2). Owner-agnostic —
// admins can view any customer's subscription, relying on the
// subscriptions_select_admin/profiles_select_admin/etc. RLS policies
// (data-model.md) rather than an app-layer ownership check.
export default async function AdminSubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "id, status, frequency, delivery_interval_days, next_delivery_date, paused_until, address_id, price_breakdown, user_id, renewal_attempt_count, next_renewal_attempt_date"
    )
    .eq("id", id)
    .maybeSingle();

  if (!subscription) {
    notFound();
  }

  const [{ data: items }, { data: address }, { data: profile }, { data: payments }] =
    await Promise.all([
      supabase
        .from("subscription_items")
        .select("quantity, products(name_ar)")
        .eq("subscription_id", id),
      supabase
        .from("addresses")
        .select("label, cities(name_ar)")
        .eq("id", subscription.address_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", subscription.user_id)
        .single(),
      supabase
        .from("payments")
        .select("id, created_at, amount_halalas, status, failure_reason, attempt_number, kind")
        .eq("subscription_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const cityRow = Array.isArray(address?.cities) ? address.cities[0] : address?.cities;

  const dunning =
    subscription.status === "active" && subscription.renewal_attempt_count > 0
      ? {
          renewalAttemptCount: subscription.renewal_attempt_count,
          nextRenewalAttemptDate: subscription.next_renewal_attempt_date,
        }
      : null;

  return (
    <AdminShell activePath="/admin/subscriptions">
      <div className="flex flex-col gap-stack-lg">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          تفاصيل الاشتراك
        </h1>
        <SubscriptionDetailView
          subscription={{
            id: subscription.id,
            status: subscription.status,
            frequency: subscription.frequency,
            deliveryIntervalDays: subscription.delivery_interval_days,
            nextDeliveryDate: subscription.next_delivery_date,
            pausedUntil: subscription.paused_until,
            customerName: profile?.full_name ?? "—",
            customerEmail: profile?.email ?? null,
            customerPhone: profile?.phone ?? "—",
            addressLabel: address?.label ?? "—",
            addressCity: cityRow?.name_ar ?? null,
            items: (items ?? []).map((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              return { productNameAr: product?.name_ar ?? "", quantity: item.quantity };
            }),
            priceBreakdown: subscription.price_breakdown as PriceBreakdown,
            payments: (payments ?? []).map((payment) => ({
              id: payment.id,
              createdAt: payment.created_at,
              amountHalalas: payment.amount_halalas,
              status: payment.status,
              failureReason: payment.failure_reason,
              attemptNumber: payment.attempt_number,
              kind: payment.kind,
            })),
            dunning,
          }}
        />
      </div>
    </AdminShell>
  );
}

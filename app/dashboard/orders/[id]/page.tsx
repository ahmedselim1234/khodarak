import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrderDetail } from "@/components/dashboard/orders/OrderDetail";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

// /dashboard/orders/[id] — new in this phase (US4). Owner-scoped: not
// found/not owned both resolve to notFound() (Acceptance Scenario 4, per
// contracts/orders-api.md's detail query — never confirms another
// customer's order id is valid).
export default async function DashboardOrderDetailPage({
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
    redirect(`/login?redirect=/dashboard/orders/${id}`);
  }

  const { data: order } = await supabase
    .from("orders")
    .select("scheduled_date, delivered_at, status, address_snapshot, price_breakdown")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name_snapshot, unit_price_snapshot, quantity")
    .eq("order_id", id);

  return (
    <DashboardShell activePath="/dashboard/orders">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-lg">
        تفاصيل الطلب
      </h1>
      <OrderDetail
        order={{
          scheduledDate: order.scheduled_date,
          deliveredAt: order.delivered_at,
          status: order.status,
          addressSnapshot: order.address_snapshot ?? {},
          items: (items ?? []).map((item) => ({
            productNameSnapshot: item.product_name_snapshot,
            unitPriceSnapshot: Number(item.unit_price_snapshot),
            quantity: item.quantity,
          })),
          priceBreakdown: order.price_breakdown as PriceBreakdown,
        }}
      />
    </DashboardShell>
  );
}

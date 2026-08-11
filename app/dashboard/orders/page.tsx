import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrderList } from "@/components/dashboard/orders/OrderList";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

// /dashboard/orders — replaces the Phase 0 placeholder (US4). Read-only, no
// client-side mutation — fetched directly here (Constitution Principle I),
// same pattern as app/subscription/confirmed/[id]/page.tsx from Phase 5, per
// contracts/orders-api.md.
export default async function DashboardOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, scheduled_date, status, price_breakdown")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((order) => ({
    id: order.id,
    scheduledDate: order.scheduled_date,
    status: order.status,
    totalPerDelivery: (order.price_breakdown as PriceBreakdown).totalPerDelivery,
  }));

  return (
    <DashboardShell activePath="/dashboard/orders">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-lg">
        طلباتي
      </h1>
      <OrderList orders={rows} />
    </DashboardShell>
  );
}

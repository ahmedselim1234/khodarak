import { createClient } from "@/lib/supabase/server";

// Server Component — three aggregates computed fresh on every request
// (research.md §5), no caching — satisfies SC-005's "never more than one
// page-load stale" directly.
export async function CountersOverview() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";
  const nextMonthStart = (() => {
    const date = new Date(`${monthStart}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    return date.toISOString().slice(0, 10);
  })();

  const [{ count: activeSubscriptions }, { count: ordersToday }, { data: revenueRows }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("scheduled_date", today),
      supabase
        .from("payments")
        .select("amount_halalas")
        .eq("status", "paid")
        .gte("created_at", monthStart)
        .lt("created_at", nextMonthStart),
    ]);

  const revenueHalalas = (revenueRows ?? []).reduce(
    (sum, row) => sum + (row.amount_halalas ?? 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
      <div className="bg-surface rounded-[20px] p-stack-lg border border-outline-variant/30 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">الاشتراكات النشطة</p>
        <p className="font-display-lg text-display-lg text-primary font-bold">
          {activeSubscriptions ?? 0}
        </p>
      </div>
      <div className="bg-surface rounded-[20px] p-stack-lg border border-outline-variant/30 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">طلبات اليوم</p>
        <p className="font-display-lg text-display-lg text-primary font-bold">
          {ordersToday ?? 0}
        </p>
      </div>
      <div className="bg-surface rounded-[20px] p-stack-lg border border-outline-variant/30 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          الإيرادات هذا الشهر
        </p>
        <p className="font-display-lg text-display-lg text-primary font-bold">
          {(revenueHalalas / 100).toFixed(2)} ر.س
        </p>
      </div>
    </div>
  );
}

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

  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setUTCDate(sevenDaysAgoDate.getUTCDate() - 7);
  const sevenDaysAgo = sevenDaysAgoDate.toISOString();

  const [
    { count: activeSubscriptions },
    { count: ordersToday },
    { data: revenueRows },
    { count: autoSuspendedThisWeek },
  ] = await Promise.all([
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
    // FR-012 (Phase 9): auto-suspensions only — Phase 7's own established
    // signature for one (initiated_by_admin_id is null and resume_date is
    // null distinguishes it from both a customer's own dated pause and an
    // admin-initiated one, per data-model.md) — the aggregate trend an
    // operator needs to notice, not visible from any one customer's own
    // record alone.
    supabase
      .from("subscription_pauses")
      .select("id", { count: "exact", head: true })
      .is("initiated_by_admin_id", null)
      .is("resume_date", null)
      .gte("started_at", sevenDaysAgo),
  ]);

  const revenueHalalas = (revenueRows ?? []).reduce(
    (sum, row) => sum + (row.amount_halalas ?? 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-stack-md">
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
      <div className="bg-surface rounded-[20px] p-stack-lg border border-outline-variant/30 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          الاشتراكات الموقوفة تلقائياً هذا الأسبوع
        </p>
        <p
          className={
            (autoSuspendedThisWeek ?? 0) > 0
              ? "font-display-lg text-display-lg text-error font-bold"
              : "font-display-lg text-display-lg text-primary font-bold"
          }
        >
          {autoSuspendedThisWeek ?? 0}
        </p>
      </div>
    </div>
  );
}

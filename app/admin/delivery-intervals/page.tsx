import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeliveryIntervalTable } from "@/components/admin/deliveryIntervals/DeliveryIntervalTable";
import { createClient } from "@/lib/supabase/server";

// /admin/delivery-intervals — new this phase (Phase 10, US1). All rows
// (active + inactive) are fetched — DeliveryIntervalTable renders inactive
// ones muted rather than hiding them.
export default async function AdminDeliveryIntervalsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("delivery_intervals")
    .select("id, days, discount_percent, is_active")
    .order("days");

  const intervals = (data ?? []).map((row) => ({
    id: row.id,
    days: row.days,
    discountPercent: Number(row.discount_percent),
    isActive: row.is_active,
  }));

  return (
    <AdminShell activePath="/admin/delivery-intervals">
      <div className="flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          إدارة الخصومات — فواصل التوصيل
        </h1>
        <Card>
          <DeliveryIntervalTable intervals={intervals} />
        </Card>
      </div>
    </AdminShell>
  );
}

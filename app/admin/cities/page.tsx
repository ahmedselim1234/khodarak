import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { CityTable } from "@/components/admin/cities/CityTable";
import { createClient } from "@/lib/supabase/server";

// /admin/cities — new this phase (US5).
export default async function AdminCitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("id, name_ar, is_active, delivery_fee_override")
    .order("name_ar");

  const cities = (data ?? []).map((row) => ({
    id: row.id,
    nameAr: row.name_ar,
    isActive: row.is_active,
    deliveryFeeOverride: row.delivery_fee_override,
  }));

  return (
    <AdminShell activePath="/admin/cities">
      <div className="flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          إدارة المدن ومناطق التوصيل
        </h1>
        <Card>
          <CityTable cities={cities} />
        </Card>
      </div>
    </AdminShell>
  );
}

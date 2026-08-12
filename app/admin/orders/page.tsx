import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { OrderTable } from "@/components/admin/orders/OrderTable";
import { parseAdminOrdersSearchParams, queryAdminOrders } from "@/lib/admin/queryAdminOrders";

const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "out_for_delivery", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

// /admin/orders — new this phase (US1). Server Component: requireAdmin is
// enforced by the RLS policy underneath queryAdminOrders (Constitution
// Principle V) — middleware.ts already gates /admin for the admin role at
// the route level too.
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = parseAdminOrdersSearchParams(params);
  const { orders, totalCount } = await queryAdminOrders(query);

  return (
    <AdminShell activePath="/admin/orders">
      <div className="flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          إدارة الطلبات
        </h1>

        <AdminFilterBar
          statusOptions={STATUS_OPTIONS}
          statusValue={query.status ?? ""}
          dateFields={[{ name: "date", label: "تاريخ التوصيل", defaultValue: query.date ?? "" }]}
          searchValue={query.search ?? ""}
        />

        <Card>
          <OrderTable orders={orders} />
        </Card>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {totalCount} نتيجة — صفحة {query.page}
        </p>
      </div>
    </AdminShell>
  );
}

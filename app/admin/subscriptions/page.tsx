import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { SubscriptionTable } from "@/components/admin/subscriptions/SubscriptionTable";
import {
  parseAdminSubscriptionsSearchParams,
  queryAdminSubscriptions,
} from "@/lib/admin/queryAdminSubscriptions";

const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: "pending_payment", label: "بانتظار الدفع" },
  { value: "active", label: "نشط" },
  { value: "paused", label: "متوقف مؤقتاً" },
  { value: "cancelled", label: "ملغي" },
];

// /admin/subscriptions — new this phase (US2).
export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = parseAdminSubscriptionsSearchParams(params);
  const { subscriptions, totalCount } = await queryAdminSubscriptions(query);

  return (
    <AdminShell activePath="/admin/subscriptions">
      <div className="flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          إدارة الاشتراكات
        </h1>

        <AdminFilterBar
          statusOptions={STATUS_OPTIONS}
          statusValue={query.status ?? ""}
          searchValue={query.search ?? ""}
        />

        <Card>
          <SubscriptionTable subscriptions={subscriptions} />
        </Card>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {totalCount} نتيجة — صفحة {query.page}
        </p>
      </div>
    </AdminShell>
  );
}

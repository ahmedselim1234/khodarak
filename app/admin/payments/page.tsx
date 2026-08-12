import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { PaymentTable } from "@/components/admin/payments/PaymentTable";
import { parseAdminPaymentsSearchParams, queryAdminPayments } from "@/lib/admin/queryAdminPayments";

const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: "paid", label: "ناجحة" },
  { value: "failed", label: "فاشلة" },
  { value: "initiated", label: "قيد المعالجة" },
];

// /admin/payments — new this phase (US4). Read-only (spec.md Assumptions).
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = parseAdminPaymentsSearchParams(params);
  const { payments, totalCount } = await queryAdminPayments(query);

  return (
    <AdminShell activePath="/admin/payments">
      <div className="flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          سجل المدفوعات
        </h1>

        <AdminFilterBar
          statusOptions={STATUS_OPTIONS}
          statusValue={query.status ?? ""}
          dateFields={[
            { name: "dateFrom", label: "من تاريخ", defaultValue: query.dateFrom ?? "" },
            { name: "dateTo", label: "إلى تاريخ", defaultValue: query.dateTo ?? "" },
          ]}
          searchValue={query.search ?? ""}
        />

        <Card>
          <PaymentTable payments={payments} />
        </Card>
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {totalCount} نتيجة — صفحة {query.page}
        </p>
      </div>
    </AdminShell>
  );
}

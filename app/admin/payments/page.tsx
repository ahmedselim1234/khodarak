import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
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

        <form method="get" className="flex flex-wrap gap-stack-sm items-end">
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="border border-outline-variant rounded-xl px-3 py-2"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="dateFrom"
            defaultValue={query.dateFrom ?? ""}
            className="border border-outline-variant rounded-xl px-3 py-2"
          />
          <input
            type="date"
            name="dateTo"
            defaultValue={query.dateTo ?? ""}
            className="border border-outline-variant rounded-xl px-3 py-2"
          />
          <input
            type="text"
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="بحث بالاسم أو البريد أو الجوال"
            className="border border-outline-variant rounded-xl px-3 py-2 flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold"
          >
            تصفية
          </button>
        </form>

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

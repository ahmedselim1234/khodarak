import { createClient } from "@/lib/supabase/server";
import { queryAdminPaginated } from "@/lib/admin/queryAdminPaginated";

export const PAGE_SIZE = 20;

export type AdminPaymentsSearchParams = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: string;
};

export type PaymentStatus = "initiated" | "paid" | "failed";

export type AdminPaymentsQuery = {
  status: PaymentStatus | null;
  dateFrom: string | null;
  dateTo: string | null;
  search: string | null;
  page: number;
};

const STATUSES: PaymentStatus[] = ["initiated", "paid", "failed"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// searchParams -> typed query, mirroring lib/products/queryProducts.ts's
// parseCatalogSearchParams shape (contracts/admin-payments-and-cities-api.md).
export function parseAdminPaymentsSearchParams(params: AdminPaymentsSearchParams): AdminPaymentsQuery {
  const status = STATUSES.includes(params.status as PaymentStatus)
    ? (params.status as PaymentStatus)
    : null;

  return {
    status,
    dateFrom: params.dateFrom && DATE_RE.test(params.dateFrom) ? params.dateFrom : null,
    dateTo: params.dateTo && DATE_RE.test(params.dateTo) ? params.dateTo : null,
    search: params.search?.trim() || null,
    page: Math.max(1, Number(params.page) || 1),
  };
}

export type AdminPaymentRow = {
  id: string;
  customerName: string;
  createdAt: string;
  amountHalalas: number | null;
  status: PaymentStatus;
  failureReason: string | null;
  attemptNumber: number;
  kind: string;
};

type PaymentRow = {
  id: string;
  created_at: string;
  amount_halalas: number | null;
  status: string;
  failure_reason: string | null;
  attempt_number: number;
  kind: string;
  profiles: { full_name: string; email: string; phone: string } | { full_name: string; email: string; phone: string }[] | null;
};

export async function queryAdminPayments(
  query: AdminPaymentsQuery
): Promise<{ payments: AdminPaymentRow[]; totalCount: number }> {
  const supabase = await createClient();

  const { data, totalCount } = await queryAdminPaginated<PaymentRow>({
    supabase,
    table: "payments",
    select:
      "id, created_at, amount_halalas, status, failure_reason, attempt_number, kind, profiles(full_name, email, phone)",
    page: query.page,
    pageSize: PAGE_SIZE,
    orderBy: [{ column: "created_at", ascending: false }],
    filters: [
      ...(query.status ? [{ column: "status", value: query.status }] : []),
      ...(query.dateFrom
        ? [{ column: "created_at", operator: "gte" as const, value: query.dateFrom }]
        : []),
      ...(query.dateTo
        ? [{ column: "created_at", operator: "lte" as const, value: `${query.dateTo}T23:59:59` }]
        : []),
    ],
    search: query.search,
    searchColumns: ["full_name", "email", "phone"],
    searchReferencedTable: "profiles",
  });

  const payments = data.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      customerName: profile?.full_name ?? "—",
      createdAt: row.created_at,
      amountHalalas: row.amount_halalas,
      status: row.status as PaymentStatus,
      failureReason: row.failure_reason,
      attemptNumber: row.attempt_number,
      kind: row.kind,
    };
  });

  return { payments, totalCount };
}

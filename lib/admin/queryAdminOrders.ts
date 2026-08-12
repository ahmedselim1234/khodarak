import { createClient } from "@/lib/supabase/server";
import { queryAdminPaginated } from "@/lib/admin/queryAdminPaginated";
import type { OrderStatus } from "@/lib/orders/orderStatusTransition";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

export const PAGE_SIZE = 20;

export type AdminOrdersSearchParams = {
  status?: string;
  date?: string;
  search?: string;
  page?: string;
};

export type AdminOrdersQuery = {
  status: OrderStatus | null;
  date: string | null;
  search: string | null;
  page: number;
};

const STATUSES: OrderStatus[] = ["pending", "out_for_delivery", "delivered", "cancelled"];

// searchParams -> typed query, mirroring lib/products/queryProducts.ts's
// parseCatalogSearchParams shape (contracts/admin-orders-api.md).
export function parseAdminOrdersSearchParams(params: AdminOrdersSearchParams): AdminOrdersQuery {
  const status = STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : null;

  return {
    status,
    date: params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : null,
    search: params.search?.trim() || null,
    page: Math.max(1, Number(params.page) || 1),
  };
}

export type AdminOrderRow = {
  id: string;
  customerName: string;
  scheduledDate: string;
  status: OrderStatus;
  totalPerDelivery: number;
};

// Requires the caller to have already passed requireAdmin() — relies on
// the orders_select_admin/profiles_select_admin RLS policies underneath
// (data-model.md), not an app-layer filter, as the actual authorization
// boundary (Constitution Principle V).
type OrderRow = {
  id: string;
  scheduled_date: string;
  status: string;
  price_breakdown: PriceBreakdown;
  profiles: { full_name: string; email: string; phone: string } | { full_name: string; email: string; phone: string }[] | null;
};

export async function queryAdminOrders(
  query: AdminOrdersQuery
): Promise<{ orders: AdminOrderRow[]; totalCount: number }> {
  const supabase = await createClient();

  const { data, totalCount } = await queryAdminPaginated<OrderRow>({
    supabase,
    table: "orders",
    select: "id, scheduled_date, status, price_breakdown, profiles(full_name, email, phone)",
    page: query.page,
    pageSize: PAGE_SIZE,
    orderBy: [
      { column: "scheduled_date", ascending: false },
      { column: "created_at", ascending: false },
    ],
    filters: [
      ...(query.status ? [{ column: "status", value: query.status }] : []),
      ...(query.date ? [{ column: "scheduled_date", value: query.date }] : []),
    ],
    search: query.search,
    searchColumns: ["full_name", "email", "phone"],
    searchReferencedTable: "profiles",
  });

  const orders = data.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      customerName: profile?.full_name ?? "—",
      scheduledDate: row.scheduled_date,
      status: row.status as OrderStatus,
      totalPerDelivery: row.price_breakdown.totalPerDelivery,
    };
  });

  return { orders, totalCount };
}

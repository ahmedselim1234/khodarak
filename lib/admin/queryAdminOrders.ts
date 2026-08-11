import { createClient } from "@/lib/supabase/server";
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
export async function queryAdminOrders(
  query: AdminOrdersQuery
): Promise<{ orders: AdminOrderRow[]; totalCount: number }> {
  const supabase = await createClient();

  let request = supabase
    .from("orders")
    .select("id, scheduled_date, status, price_breakdown, profiles(full_name, email, phone)", {
      count: "exact",
    })
    .order("scheduled_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (query.status) request = request.eq("status", query.status);
  if (query.date) request = request.eq("scheduled_date", query.date);
  if (query.search) {
    request = request.or(
      `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`,
      { referencedTable: "profiles" }
    );
  }

  const from = (query.page - 1) * PAGE_SIZE;
  const { data, count } = await request.range(from, from + PAGE_SIZE - 1);

  const orders = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      customerName: profile?.full_name ?? "—",
      scheduledDate: row.scheduled_date,
      status: row.status as OrderStatus,
      totalPerDelivery: (row.price_breakdown as PriceBreakdown).totalPerDelivery,
    };
  });

  return { orders, totalCount: count ?? 0 };
}

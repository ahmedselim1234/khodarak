import { createClient } from "@/lib/supabase/server";
import { queryAdminPaginated } from "@/lib/admin/queryAdminPaginated";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";

export const PAGE_SIZE = 20;

export type AdminSubscriptionsSearchParams = {
  status?: string;
  search?: string;
  page?: string;
};

export type SubscriptionStatus = "pending_payment" | "active" | "paused" | "cancelled";

export type AdminSubscriptionsQuery = {
  status: SubscriptionStatus | null;
  search: string | null;
  page: number;
};

const STATUSES: SubscriptionStatus[] = ["pending_payment", "active", "paused", "cancelled"];

// searchParams -> typed query, mirroring lib/products/queryProducts.ts's
// parseCatalogSearchParams shape (contracts/admin-subscriptions-api.md).
export function parseAdminSubscriptionsSearchParams(
  params: AdminSubscriptionsSearchParams
): AdminSubscriptionsQuery {
  const status = STATUSES.includes(params.status as SubscriptionStatus)
    ? (params.status as SubscriptionStatus)
    : null;

  return {
    status,
    search: params.search?.trim() || null,
    page: Math.max(1, Number(params.page) || 1),
  };
}

export type AdminSubscriptionRow = {
  id: string;
  customerName: string;
  frequency: FrequencyKey | "custom_interval";
  deliveryIntervalDays: number | null;
  nextDeliveryDate: string;
  status: SubscriptionStatus;
};

type SubscriptionRow = {
  id: string;
  frequency: string;
  delivery_interval_days: number | null;
  status: string;
  next_delivery_date: string;
  profiles: { full_name: string; email: string; phone: string } | { full_name: string; email: string; phone: string }[] | null;
};

export async function queryAdminSubscriptions(
  query: AdminSubscriptionsQuery
): Promise<{ subscriptions: AdminSubscriptionRow[]; totalCount: number }> {
  const supabase = await createClient();

  const { data, totalCount } = await queryAdminPaginated<SubscriptionRow>({
    supabase,
    table: "subscriptions",
    select: "id, frequency, delivery_interval_days, status, next_delivery_date, profiles(full_name, email, phone)",
    page: query.page,
    pageSize: PAGE_SIZE,
    orderBy: [{ column: "created_at", ascending: false }],
    filters: query.status ? [{ column: "status", value: query.status }] : [],
    search: query.search,
    searchColumns: ["full_name", "email", "phone"],
    searchReferencedTable: "profiles",
  });

  const subscriptions = data.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      customerName: profile?.full_name ?? "—",
      frequency: row.frequency as FrequencyKey | "custom_interval",
      deliveryIntervalDays: row.delivery_interval_days,
      nextDeliveryDate: row.next_delivery_date,
      status: row.status as SubscriptionStatus,
    };
  });

  return { subscriptions, totalCount };
}

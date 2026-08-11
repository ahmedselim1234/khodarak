import { createClient } from "@/lib/supabase/server";
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
  frequency: FrequencyKey;
  nextDeliveryDate: string;
  status: SubscriptionStatus;
};

export async function queryAdminSubscriptions(
  query: AdminSubscriptionsQuery
): Promise<{ subscriptions: AdminSubscriptionRow[]; totalCount: number }> {
  const supabase = await createClient();

  let request = supabase
    .from("subscriptions")
    .select("id, frequency, status, next_delivery_date, profiles(full_name, email, phone)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (query.status) request = request.eq("status", query.status);
  if (query.search) {
    request = request.or(
      `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`,
      { referencedTable: "profiles" }
    );
  }

  const from = (query.page - 1) * PAGE_SIZE;
  const { data, count } = await request.range(from, from + PAGE_SIZE - 1);

  const subscriptions = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      customerName: profile?.full_name ?? "—",
      frequency: row.frequency as FrequencyKey,
      nextDeliveryDate: row.next_delivery_date,
      status: row.status as SubscriptionStatus,
    };
  });

  return { subscriptions, totalCount: count ?? 0 };
}

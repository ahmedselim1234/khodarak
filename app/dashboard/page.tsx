import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SubscriptionDashboard } from "@/components/dashboard/SubscriptionDashboard";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";
const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

// /dashboard — replaces the Phase 0 placeholder (US1). Server Component:
// finds the caller's own subscription id (middleware already redirects a
// signed-out visitor to /login before this ever runs) and the
// products/frequencies SubscriptionEditor needs, then hands off to
// SubscriptionDashboard, which owns the live status/edit/pause/cancel flow
// client-side from here (dashboardApi.ts).
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [{ data: subscription }, { data: products }, { data: settingsRow }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      // Only a subscription that has actually gone through Phase 5
      // activation belongs on the dashboard — a subscription still stuck in
      // pending_payment is Phase 5's own confirmation page's concern, not
      // this one's (this phase's Assumptions: scoped to already-active/
      // paused subscriptions).
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("products").select(PRODUCT_SELECT).eq("is_available", true).order("sort_order"),
    supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single(),
  ]);

  const mappedProducts = (products ?? []).map((row) => mapProductRow(row));
  const frequencies = settingsRow
    ? mapSettingsRow(settingsRow).frequencies
    : ({} as ReturnType<typeof mapSettingsRow>["frequencies"]);

  return (
    <DashboardShell activePath="/dashboard">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-lg">
        لوحة التحكم
      </h1>
      <SubscriptionDashboard
        subscriptionId={subscription?.id ?? null}
        products={mappedProducts}
        frequencies={frequencies}
      />
    </DashboardShell>
  );
}

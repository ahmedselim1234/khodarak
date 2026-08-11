import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

const SETTINGS_SELECT =
  "frequencies, min_order_value, max_items_per_box, edit_cutoff_hours, first_delivery_lead_days, blackout_weekdays, delivery_mode, delivery_flat_fee, delivery_free_threshold, max_pause_days, max_pauses_per_year, vat_percent, prices_include_vat, rounding_mode, updated_at";

// /admin/settings — no mockup exists (spec.md Assumptions), same treatment
// as /admin/products from Phase 2: shared design tokens + standard admin
// form conventions.
export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select(SETTINGS_SELECT).eq("id", 1).single();

  // The settings row is seeded by migration and never deleted (data-model.md
  // Lifecycle) — a missing row here means the migration hasn't run.
  if (!data) {
    notFound();
  }

  const settings = mapSettingsRow(data);

  return (
    <AdminShell activePath="/admin/settings">
      <div className="max-w-2xl mx-auto flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
          إعدادات التسعير والطلبات
        </h1>
        <Card>
          <SettingsForm settings={settings} />
        </Card>
      </div>
    </AdminShell>
  );
}

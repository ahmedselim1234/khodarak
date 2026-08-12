import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { mapSettingsRow } from "@/lib/pricing/mapSettingsRow";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { FULL_SETTINGS_SELECT } from "@/lib/pricing/settingsSelect";

// /admin/settings — no mockup exists (spec.md Assumptions), same treatment
// as /admin/products from Phase 2: shared design tokens + standard admin
// form conventions.
export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select(FULL_SETTINGS_SELECT).eq("id", 1).single();

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

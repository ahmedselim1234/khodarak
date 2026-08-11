import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AddressList } from "@/components/address/AddressList";
import { SavedCardSummary } from "@/components/dashboard/settings/SavedCardSummary";
import { PaymentHistoryList } from "@/components/dashboard/settings/PaymentHistoryList";
import { ProfileForm } from "@/components/dashboard/settings/ProfileForm";

// /dashboard/settings — replaces the Phase 0 placeholder (US5). Server
// Component: fetches payment_methods/payments/profiles directly (Constitution
// Principle I, contracts/settings-api.md's Notes) and reuses AddressList/
// AddressBook (Phase 1, unchanged) for address management.
export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/settings");
  }

  const [{ data: card }, { data: payments }, { data: profile }] = await Promise.all([
    supabase
      .from("payment_methods")
      .select("brand, last_four")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, created_at, amount_halalas, status, failure_reason")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
  ]);

  return (
    <DashboardShell activePath="/dashboard/settings">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-lg">
        الإعدادات
      </h1>

      <div className="flex flex-col gap-stack-lg">
        <section>
          <h2 className="font-headline-md text-headline-md font-bold mb-stack-sm">العناوين</h2>
          <AddressList />
        </section>

        <section>
          <h2 className="font-headline-md text-headline-md font-bold mb-stack-sm">
            وسيلة الدفع
          </h2>
          <SavedCardSummary
            card={card ? { brand: card.brand, lastFour: card.last_four } : null}
          />
        </section>

        <section>
          <h2 className="font-headline-md text-headline-md font-bold mb-stack-sm">
            سجل المدفوعات
          </h2>
          <PaymentHistoryList
            payments={(payments ?? []).map((payment) => ({
              id: payment.id,
              createdAt: payment.created_at,
              amountHalalas: payment.amount_halalas,
              status: payment.status,
              failureReason: payment.failure_reason,
            }))}
          />
        </section>

        <section>
          <h2 className="font-headline-md text-headline-md font-bold mb-stack-sm">
            الملف الشخصي
          </h2>
          <ProfileForm
            initialFullName={profile?.full_name ?? ""}
            initialPhone={profile?.phone ?? ""}
          />
        </section>
      </div>
    </DashboardShell>
  );
}

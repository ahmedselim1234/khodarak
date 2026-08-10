import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { AddressList } from "@/components/address/AddressList";

// Structurally references design/settings.html's address-cards section.
// Payment methods and profile-info sections stay out of scope for this
// phase (Phase 5's Moyasar integration, per plan.md §4) and are added later.
export default function DashboardSettingsPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg flex flex-col gap-stack-lg">
            <header>
              <h1 className="font-display-lg text-display-lg font-bold text-primary mb-2">
                العناوين
              </h1>
              <p className="text-on-surface-variant font-body-md">
                أدر عناوين التوصيل الخاصة بك بكل سهولة.
              </p>
            </header>
            <AddressList />
          </div>
        </Container>
      </main>
    </>
  );
}

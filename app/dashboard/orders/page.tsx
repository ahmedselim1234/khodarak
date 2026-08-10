import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function DashboardOrdersPage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="receipt_long"
          title="طلباتي"
          description="سجل الطلبات وتفاصيلها سيُبنى في مرحلة لوحة تحكم العميل القادمة."
        />
      </main>
    </>
  );
}

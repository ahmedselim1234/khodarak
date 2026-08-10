import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function DashboardPage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="space_dashboard"
          title="لوحة التحكم"
          description="بطاقة التوصيل القادمة، التقويم، وصحة الاشتراك ستُبنى في مرحلة لوحة تحكم العميل القادمة."
        />
      </main>
    </>
  );
}

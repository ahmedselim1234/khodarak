import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function DashboardSettingsPage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="settings"
          title="الإعدادات"
          description="إدارة العناوين وطرق الدفع والملف الشخصي ستُبنى في مرحلة لوحة تحكم العميل القادمة."
        />
      </main>
    </>
  );
}

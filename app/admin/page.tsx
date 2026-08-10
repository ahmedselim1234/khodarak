import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

// No design mockup exists for /admin yet — per Clarifications (2026-08-10),
// this route uses the shared design tokens with a generic layout until one
// is provided (see spec.md Assumptions and Edge Cases).
export default function AdminPage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="admin_panel_settings"
          title="لوحة الإدارة"
          description="لا يوجد تصميم جاهز لهذه الصفحة بعد — ستُبنى إدارة المنتجات والطلبات والإعدادات في مرحلة عمليات الإدارة القادمة، باستخدام نفس عناصر التصميم المشتركة."
        />
      </main>
    </>
  );
}

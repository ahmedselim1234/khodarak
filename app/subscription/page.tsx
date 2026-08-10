import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function SubscriptionPage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="calendar_month"
          title="بناء الاشتراك"
          description="معالج بناء الصندوق مع ملخص الطلب والتسعير الحي سيُبنى في مرحلة محرك التسعير القادمة."
        />
      </main>
    </>
  );
}

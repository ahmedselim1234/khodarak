import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="nutrition"
          title={`تفاصيل المنتج #${id}`}
          description="صفحة تفاصيل المنتج الكاملة ستُبنى في مرحلة الكتالوج القادمة — هذه الصفحة تؤكد أن المسار الديناميكي متاح."
        />
      </main>
    </>
  );
}

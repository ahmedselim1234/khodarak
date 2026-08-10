import { TopNav } from "@/components/ui/TopNav";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function BrowsePage() {
  return (
    <>
      <TopNav />
      <main>
        <PagePlaceholder
          icon="grocery"
          title="تصفح المنتجات"
          description="شبكة المنتجات مع فلاتر الفئة والسعر والتوفر ستُبنى هنا في المرحلة القادمة — هذه الصفحة تؤكد أن المسار متاح ومنسق بهوية خضارك البصرية."
        />
      </main>
    </>
  );
}

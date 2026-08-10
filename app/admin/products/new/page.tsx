import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function NewAdminProductPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg max-w-xl mx-auto flex flex-col gap-stack-md">
            <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
              إضافة منتج جديد
            </h1>
            <Card>
              <ProductForm />
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

import { Card } from "@/components/ui/Card";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function NewAdminProductPage() {
  return (
    <AdminShell activePath="/admin/products">
      <div className="max-w-xl mx-auto flex flex-col gap-stack-md">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
          إضافة منتج جديد
        </h1>
        <Card>
          <ProductForm />
        </Card>
      </div>
    </AdminShell>
  );
}

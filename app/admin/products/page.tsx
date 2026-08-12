import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductTableClient } from "@/components/admin/products/ProductTableClient";

// No mockup exists for /admin yet (spec.md Assumptions) — shared design
// tokens + standard admin table conventions. Wrapped in AdminShell (Phase
// 8) for consistent chrome across every /admin/* route.
export default function AdminProductsPage() {
  return (
    <AdminShell activePath="/admin/products">
      <div className="flex flex-col gap-stack-md">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-md text-headline-md text-on-background font-bold">
            إدارة المنتجات
          </h1>
          <Link href="/admin/products/new">
            <Button>إضافة منتج</Button>
          </Link>
        </div>
        <Card>
          <ProductTableClient />
        </Card>
      </div>
    </AdminShell>
  );
}

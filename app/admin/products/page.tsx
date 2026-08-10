import Link from "next/link";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductTable } from "@/components/admin/products/ProductTable";

// No mockup exists for /admin yet (spec.md Assumptions) — shared design
// tokens + standard admin table conventions, same treatment as the rest of
// /admin until Phase 8 provides one.
export default function AdminProductsPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg flex flex-col gap-stack-md">
            <div className="flex items-center justify-between">
              <h1 className="font-headline-md text-headline-md text-on-background font-bold">
                إدارة المنتجات
              </h1>
              <Link href="/admin/products/new">
                <Button>إضافة منتج</Button>
              </Link>
            </div>
            <Card>
              <ProductTable />
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

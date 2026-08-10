import { notFound } from "next/navigation";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { ProductForm } from "@/components/admin/products/ProductForm";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  const product = mapProductRow(data);

  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg max-w-xl mx-auto flex flex-col gap-stack-md">
            <h1 className="font-headline-md text-headline-md text-on-background font-bold text-right">
              تعديل {product.nameAr}
            </h1>
            <Card>
              <ProductForm product={product} />
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

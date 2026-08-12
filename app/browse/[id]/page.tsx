import { notFound } from "next/navigation";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { createCatalogClient } from "@/lib/supabase/publicCatalog";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Footer } from "@/components/ui/Footer";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

// /browse/[id] — Server Component product detail (contracts/catalog-browse.md).
// FR-017: a missing/deleted product renders notFound(), not a broken page.
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createCatalogClient(60);
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
          <div className="py-stack-lg">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <ProductGallery imageUrl={product.imageUrl} nameAr={product.nameAr} />
              <ProductInfo product={product} />
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

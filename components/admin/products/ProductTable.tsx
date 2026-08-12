import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { ProductTableClient } from "./ProductTableClient";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

// Data fetch stays on the server (RLS is the authorization boundary); the
// rendering and the optimistic row state live in ProductTableClient.
export async function ProductTable() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((row) => {
    const product = mapProductRow(row);
    return {
      id: product.id,
      nameAr: product.nameAr,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
    };
  });

  return <ProductTableClient products={products} />;
}

import { createCatalogClient } from "@/lib/supabase/publicCatalog";
import { mapProductRow, type MappedProduct } from "@/lib/products/mapProductRow";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

// One minute is short enough that an admin toggling a product sees the home
// page follow within a normal "did that work?" attention span, and long
// enough that a traffic spike from an ad campaign doesn't turn into one
// Supabase query per visitor.
const HOME_REVALIDATE_SECONDS = 60;

/**
 * Products for the marketing home page, interleaved vegetables/fruits so the
 * grid reads as a mixed basket rather than "all the tomatoes, then all the
 * apples" — `sort_order` alone groups by whatever the admin happened to
 * enter first.
 */
export async function queryHomeProducts(limit = 8): Promise<MappedProduct[]> {
  const supabase = createCatalogClient(HOME_REVALIDATE_SECONDS);

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const products = (data ?? []).map((row) => mapProductRow(row));

  const vegetables = products.filter((product) => product.category === "vegetables");
  const fruits = products.filter((product) => product.category === "fruits");

  const interleaved: MappedProduct[] = [];
  for (let index = 0; index < Math.max(vegetables.length, fruits.length); index += 1) {
    if (vegetables[index]) interleaved.push(vegetables[index]);
    if (fruits[index]) interleaved.push(fruits[index]);
  }

  return interleaved.slice(0, limit);
}

import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductCategory } from "@/lib/products/mapProductRow";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

export const PAGE_SIZE = 12;

export type CatalogSort = "price_asc" | "price_desc" | "newest";

export type CatalogSearchParams = {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
  page?: string;
};

export type CatalogQuery = {
  category: ProductCategory;
  sort: CatalogSort;
  minPrice: number | null;
  maxPrice: number | null;
  availableOnly: boolean;
  page: number;
};

// Normalizes raw searchParams into a typed query per
// contracts/catalog-browse.md's defaults.
export function parseCatalogSearchParams(params: CatalogSearchParams): CatalogQuery {
  const category: ProductCategory = params.category === "fruits" ? "fruits" : "vegetables";
  const sort: CatalogSort =
    params.sort === "price_asc" || params.sort === "price_desc" || params.sort === "newest"
      ? params.sort
      : "newest";

  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;
  const availableOnly = params.available === "1";
  const page = Math.max(1, Number(params.page) || 1);

  return {
    category,
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    availableOnly,
    page,
  };
}

export async function queryProducts(query: CatalogQuery) {
  const supabase = await createClient();

  let request = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("category", query.category);

  if (query.minPrice !== null) {
    request = request.gte("price", query.minPrice);
  }
  if (query.maxPrice !== null) {
    request = request.lte("price", query.maxPrice);
  }
  if (query.availableOnly) {
    request = request.eq("is_available", true);
  }

  if (query.sort === "price_asc") {
    request = request.order("price", { ascending: true });
  } else if (query.sort === "price_desc") {
    request = request.order("price", { ascending: false });
  } else if (query.sort === "newest") {
    request = request.order("created_at", { ascending: false });
  }
  // Tiebreaker / default ordering per spec Assumptions.
  request = request.order("sort_order", { ascending: true });

  const from = (query.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  request = request.range(from, to);

  const { data, count } = await request;

  return {
    products: (data ?? []).map((row) => mapProductRow(row)),
    totalCount: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

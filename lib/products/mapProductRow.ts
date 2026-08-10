export type ProductCategory = "vegetables" | "fruits";
export type ProductUnit = "kg" | "piece";

type ProductRow = {
  id: string;
  name_ar: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  image_url: string;
  is_available: boolean;
  min_qty: number;
  max_qty: number;
  sort_order: number;
  created_at: string;
};

// Maps a Supabase `products` row (snake_case) to the camelCase shape used
// throughout the app and documented in contracts/products-admin-api.md.
export function mapProductRow(row: ProductRow) {
  return {
    id: row.id,
    nameAr: row.name_ar,
    category: row.category,
    price: Number(row.price),
    unit: row.unit,
    imageUrl: row.image_url,
    isAvailable: row.is_available,
    minQty: row.min_qty,
    maxQty: row.max_qty,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export type MappedProduct = ReturnType<typeof mapProductRow>;

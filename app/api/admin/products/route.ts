import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { productCreateSchema } from "@/lib/validation/product";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";
import { mapProductRow } from "@/lib/products/mapProductRow";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

const IMAGE_URL_MARKER = "/product-images/";

// GET /api/admin/products — backs productsAdminApi's listProducts query, the
// cache that createProduct/updateProduct/deleteProduct optimistically patch.
export async function GET() {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ products: (data ?? []).map(mapProductRow) });
}

// POST /api/admin/products — per contracts/products-admin-api.md. Not under
// the /admin path prefix, so middleware.ts's route-protection matrix does
// NOT cover this handler — role-checking happens here, backstopped by RLS
// (products_insert_admin) underneath (Constitution Principle V).
export async function POST(request: Request) {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = productCreateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  // Never trust a client-supplied URL blindly, even post-upload (research.md
  // §3) — it must resolve into the product-images bucket.
  if (!result.data.imageUrl.includes(IMAGE_URL_MARKER)) {
    return NextResponse.json(
      { error: "validation_failed", fields: { imageUrl: "الصورة غير صالحة" } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name_ar: result.data.nameAr,
      category: result.data.category,
      price: result.data.price,
      unit: result.data.unit,
      image_url: result.data.imageUrl,
      min_qty: result.data.minQty,
      max_qty: result.data.maxQty,
      ...(result.data.sortOrder !== undefined && { sort_order: result.data.sortOrder }),
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // The storefront reads the catalog through a tagged, cached fetch
  // (lib/supabase/publicCatalog.ts). Without this, an admin's change would
  // only appear once the 60s revalidation window elapsed. Next 16 requires
  // the second argument; `{ expire: 0 }` is "drop it now".
  revalidateTag("catalog", { expire: 0 });

  return NextResponse.json({ product: mapProductRow(data) }, { status: 201 });
}

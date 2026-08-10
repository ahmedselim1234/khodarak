import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productCreateSchema } from "@/lib/validation/product";
import { mapProductRow } from "@/lib/products/mapProductRow";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

const IMAGE_URL_MARKER = "/product-images/";

// POST /api/admin/products — per contracts/products-admin-api.md. Not under
// the /admin path prefix, so middleware.ts's route-protection matrix does
// NOT cover this handler — role-checking happens here, backstopped by RLS
// (products_insert_admin) underneath (Constitution Principle V).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const result = productCreateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
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
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ product: mapProductRow(data) }, { status: 201 });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productUpdateSchema } from "@/lib/validation/product";
import { mapProductRow } from "@/lib/products/mapProductRow";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

const IMAGE_URL_MARKER = "/product-images/";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

// PATCH /api/admin/products/[id] — per contracts/products-admin-api.md.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const result = productUpdateSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  if (result.data.imageUrl !== undefined && !result.data.imageUrl.includes(IMAGE_URL_MARKER)) {
    return NextResponse.json(
      { error: "validation_failed", fields: { imageUrl: "الصورة غير صالحة" } },
      { status: 400 }
    );
  }

  const { nameAr, category, price, unit, imageUrl, isAvailable, minQty, maxQty } = result.data;

  const { data, error } = await supabase
    .from("products")
    .update({
      ...(nameAr !== undefined && { name_ar: nameAr }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price }),
      ...(unit !== undefined && { unit }),
      ...(imageUrl !== undefined && { image_url: imageUrl }),
      ...(isAvailable !== undefined && { is_available: isAvailable }),
      ...(minQty !== undefined && { min_qty: minQty }),
      ...(maxQty !== undefined && { max_qty: maxQty }),
    })
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ product: mapProductRow(data) });
}

// DELETE /api/admin/products/[id] — hard delete (data-model.md Lifecycle).
// cart_items rows referencing it cascade-delete (FK), which is how the
// "admin deletes a product that's in someone's cart" edge case resolves.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

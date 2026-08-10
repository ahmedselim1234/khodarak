import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cartItemUpsertSchema } from "@/lib/validation/cart";
import { clampQuantity } from "@/lib/cart/clampQuantity";

// PUT /api/cart/items/[productId] — per contracts/cart-api.md. Upserts the
// caller's quantity, clamped server-side (the authoritative clamp; the
// client's own clampQuantity call is just for instant feedback).
export async function PUT(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = cartItemUpsertSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, is_available, min_qty, max_qty")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  // FR-018: an unavailable product can't be newly added, but a row already
  // in the cart from before it went unavailable may still have its quantity
  // decreased via this same endpoint.
  if (!product.is_available && !existing && result.data.quantity > 0) {
    return NextResponse.json({ error: "product_unavailable" }, { status: 409 });
  }

  const clamped = clampQuantity(result.data.quantity, {
    minQty: product.min_qty,
    maxQty: product.max_qty,
  });

  if (clamped === 0) {
    if (existing) {
      await supabase.from("cart_items").delete().eq("id", existing.id);
    }
    return NextResponse.json({ productId, quantity: 0 });
  }

  if (existing) {
    await supabase.from("cart_items").update({ quantity: clamped }).eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: clamped });
  }

  return NextResponse.json({ productId, quantity: clamped });
}

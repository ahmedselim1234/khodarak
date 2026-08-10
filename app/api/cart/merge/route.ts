import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cartMergeSchema } from "@/lib/validation/cart";
import { mergeCartQuantities } from "@/lib/cart/mergeCartQuantities";

// POST /api/cart/merge — per contracts/cart-api.md (FR-015). Merges a guest
// cart payload into the caller's server-side cart_items; products deleted
// since the guest added them are silently skipped (a merge, not a replay).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = cartMergeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  let merged = 0;
  let skipped = 0;

  for (const item of result.data.items) {
    const { data: product } = await supabase
      .from("products")
      .select("id, min_qty, max_qty")
      .eq("id", item.productId)
      .maybeSingle();

    if (!product) {
      skipped += 1;
      continue;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", item.productId)
      .maybeSingle();

    const mergedQuantity = mergeCartQuantities(existing?.quantity, item.quantity, {
      minQty: product.min_qty,
      maxQty: product.max_qty,
    });

    if (mergedQuantity === 0) {
      skipped += 1;
      continue;
    }

    if (existing) {
      await supabase.from("cart_items").update({ quantity: mergedQuantity }).eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: item.productId, quantity: mergedQuantity });
    }

    merged += 1;
  }

  return NextResponse.json({ merged, skipped });
}

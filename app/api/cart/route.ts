import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CART_SELECT =
  "quantity, products(id, name_ar, price, unit, image_url, is_available, min_qty, max_qty)";

type CartItemRow = {
  quantity: number;
  products:
    | {
        id: string;
        name_ar: string;
        price: number;
        unit: string;
        image_url: string;
        is_available: boolean;
        min_qty: number;
        max_qty: number;
      }
    | Array<{
        id: string;
        name_ar: string;
        price: number;
        unit: string;
        image_url: string;
        is_available: boolean;
        min_qty: number;
        max_qty: number;
      }>
    | null;
};

// GET /api/cart — per contracts/cart-api.md. `total` is an unlocked preview
// computed from live products data (research.md §4), not a persisted or
// charged value.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const items = ((data ?? []) as CartItemRow[])
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!product) return null;
      return {
        productId: product.id,
        quantity: row.quantity,
        name: product.name_ar,
        price: Number(product.price),
        unit: product.unit,
        imageUrl: product.image_url,
        isAvailable: product.is_available,
        minQty: product.min_qty,
        maxQty: product.max_qty,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return NextResponse.json({ items, itemCount, total });
}

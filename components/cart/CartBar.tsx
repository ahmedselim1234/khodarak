"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/lib/cart/useCart";

// Header cart button — links to the standalone /cart page. Reads through
// useCart, so the badge reflects the guest slice or the signed-in query
// without this component knowing which. Because both write paths are
// optimistic, the badge increments in the same frame as an "add" press
// anywhere in the app.
export function CartBar() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      prefetch
      className="relative rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container"
      aria-label={itemCount > 0 ? `الصندوق — ${itemCount} صنف` : "الصندوق"}
    >
      <ShoppingBasket className="size-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span
          // -end-1 rather than -left-1 so the badge stays on the outer corner
          // when the layout mirrors.
          className="absolute -top-1 -end-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold leading-none text-on-secondary tabular"
          aria-hidden
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}

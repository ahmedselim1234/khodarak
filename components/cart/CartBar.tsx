"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { useSelector } from "react-redux";
import { useAuthUserId } from "@/lib/supabase/useAuthUser";
import { useGetCartQuery } from "@/lib/store/cartApi";
import { selectGuestCartCount } from "@/lib/cart/cartSlice";

// Header cart icon card (FR-013) — reads the guest cartSlice or the
// signed-in cartApi query depending on auth state; a small badge shows the
// item count once the cart isn't empty. Lives in TopNav's icon row instead
// of as a bar fixed to the viewport bottom, which used to overlap page
// content (e.g. the subscription builder's own delivery-date picker).
export function CartBar() {
  const userId = useAuthUserId();
  const signedIn = Boolean(userId);

  const guestCount = useSelector(selectGuestCartCount);
  const { data: cart } = useGetCartQuery(undefined, { skip: !signedIn });

  const itemCount = signedIn ? (cart?.itemCount ?? 0) : guestCount;

  return (
    <Link
      href="/subscription"
      className="relative rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container"
      aria-label="الصندوق"
    >
      <ShoppingBasket className="size-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span
          // -end-1 rather than -left-1 so the badge stays on the outer corner
          // when the layout mirrors.
          className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-secondary text-on-secondary text-[11px] font-bold leading-none tabular"
          aria-hidden
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}

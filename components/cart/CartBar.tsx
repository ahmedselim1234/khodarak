"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useAuthUserId } from "@/lib/supabase/useAuthUser";
import { useGetCartQuery } from "@/lib/store/cartApi";
import { selectGuestCartCount, selectGuestCartTotal } from "@/lib/cart/cartSlice";
import type { RootState } from "@/lib/store";

// Persistent cart bar (FR-013) — reads the guest cartSlice or the signed-in
// cartApi query depending on auth state; zero state when empty.
export function CartBar() {
  const userId = useAuthUserId();
  const signedIn = Boolean(userId);

  const guestCount = useSelector(selectGuestCartCount);
  const guestTotal = useSelector((state: RootState) => selectGuestCartTotal(state));
  const { data: cart } = useGetCartQuery(undefined, { skip: !signedIn });

  const itemCount = signedIn ? (cart?.itemCount ?? 0) : guestCount;
  const total = signedIn ? (cart?.total ?? 0) : guestTotal;

  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      href="/subscription"
      className="fixed bottom-4 inset-x-4 md:inset-x-auto md:left-6 md:right-6 z-40 flex items-center justify-between gap-stack-md bg-primary text-on-primary rounded-full px-6 py-4 shadow-lg max-w-container-max mx-auto hover:opacity-95 transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined" aria-hidden>
          shopping_basket
        </span>
        <span className="font-label-sm text-label-sm font-bold">{itemCount} منتج</span>
      </div>
      <span className="font-headline-md text-headline-md font-bold">
        {total.toFixed(2)} ر.س
      </span>
    </Link>
  );
}

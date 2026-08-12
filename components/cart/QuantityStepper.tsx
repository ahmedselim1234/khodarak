"use client";

import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "lucide-react";
import { useAuthUserId } from "@/lib/supabase/useAuthUser";
import { useGetCartQuery, useUpsertCartItemMutation } from "@/lib/store/cartApi";
import { setItemQuantity } from "@/lib/cart/cartSlice";
import { clampQuantity } from "@/lib/cart/clampQuantity";
import type { RootState } from "@/lib/store";

export type StepperProduct = {
  id: string;
  nameAr: string;
  price: number;
  unit: string;
  imageUrl: string;
  minQty: number;
  maxQty: number;
  isAvailable: boolean;
};

// Used on both the grid card and the detail page (US2/US4). Calls the
// signed-in cartApi mutation or the guest cartSlice action depending on
// auth state, clamped via clampQuantity for instant feedback (FR-011/012).
export function QuantityStepper({ product }: { product: StepperProduct }) {
  const userId = useAuthUserId();
  const dispatch = useDispatch();
  const signedIn = Boolean(userId);

  const guestQuantity = useSelector(
    (state: RootState) => state.cart.items[product.id]?.quantity ?? 0
  );
  const { data: cart } = useGetCartQuery(undefined, { skip: !signedIn });
  const [upsertCartItem, { isLoading: upserting }] = useUpsertCartItemMutation();

  const quantity = signedIn
    ? (cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0)
    : guestQuantity;

  const bounds = { minQty: product.minQty, maxQty: product.maxQty };

  async function applyQuantity(next: number) {
    const clamped = clampQuantity(next, bounds);

    if (signedIn) {
      await upsertCartItem({ productId: product.id, quantity: clamped }).unwrap().catch(() => {});
      return;
    }

    dispatch(
      setItemQuantity({
        productId: product.id,
        quantity: clamped,
        name: product.nameAr,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        maxQty: product.maxQty,
      })
    );
  }

  // FR-018: can't newly add an unavailable product, but an existing
  // quantity may still be decreased.
  if (quantity === 0 && !product.isAvailable) {
    return (
      <span className="font-label-sm text-label-sm text-outline">غير متوفر</span>
    );
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => applyQuantity(product.minQty)}
        disabled={upserting}
        aria-label="أضف للصندوق"
        className="flex size-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-primary-container hover:text-on-primary-container hover:shadow-md disabled:opacity-45"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 border border-outline-variant gap-1">
      <button
        type="button"
        onClick={() => applyQuantity(quantity - 1)}
        disabled={upserting}
        aria-label="إنقاص الكمية"
        className="flex size-7 items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-surface-container-high disabled:opacity-45"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-small font-bold tabular">{quantity}</span>
      <button
        type="button"
        onClick={() => applyQuantity(quantity + 1)}
        disabled={upserting || !product.isAvailable}
        aria-label="زيادة الكمية"
        className="flex size-7 items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-surface-container-high disabled:opacity-45"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

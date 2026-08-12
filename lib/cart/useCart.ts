"use client";

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUserId } from "@/lib/supabase/useAuthUser";
import {
  useGetCartQuery,
  useUpsertCartItemMutation,
  type CartLine,
  type CartLineMeta,
} from "@/lib/store/cartApi";
import { setItemQuantity, clearCart as clearGuestCart } from "@/lib/cart/cartSlice";
import { clampQuantity } from "@/lib/cart/clampQuantity";
import type { RootState } from "@/lib/store";

export type { CartLine, CartLineMeta };

const EMPTY_LINES: CartLine[] = [];

// One cart API for the whole app, regardless of auth state. Before this,
// every component that touched the cart (CartBar, QuantityStepper, and now
// the /cart page) re-implemented the same "guest slice or server query?"
// branch, and each one drifted slightly.
//
// Writes are fire-and-forget on purpose: the guest path is a synchronous
// reducer, and the signed-in path patches the RTK Query cache optimistically
// inside cartApi and rolls back on failure. Neither ever blocks the press.
export function useCart() {
  const userId = useAuthUserId();
  const signedIn = Boolean(userId);
  const resolvingAuth = userId === undefined;

  const dispatch = useDispatch();
  // Select the raw record, not a derived array — `Object.values()` inside a
  // selector returns a new reference on every store notification, which makes
  // useSelector re-render on unrelated state changes.
  const guestMap = useSelector((state: RootState) => state.cart.items);
  const guestHydrated = useSelector((state: RootState) => state.cart.hydrated);

  const { data: serverCart, isLoading: serverLoading } = useGetCartQuery(undefined, {
    skip: !signedIn,
  });
  const [upsertCartItem] = useUpsertCartItemMutation();

  const items = useMemo<CartLine[]>(() => {
    if (signedIn) return serverCart?.items ?? EMPTY_LINES;
    return Object.values(guestMap).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      unit: item.unit,
      imageUrl: item.imageUrl,
      // The guest cart only ever holds products that were available when they
      // were added; availability is re-checked server-side at merge and at
      // checkout, which is the boundary that actually matters.
      isAvailable: true,
      minQty: item.minQty ?? 1,
      maxQty: item.maxQty ?? 99,
    }));
  }, [signedIn, serverCart, guestMap]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const quantityOf = useCallback(
    (productId: string) => items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items]
  );

  const setQuantity = useCallback(
    (line: CartLineMeta, nextQuantity: number) => {
      const clamped = clampQuantity(nextQuantity, {
        minQty: line.minQty,
        maxQty: line.maxQty,
      });

      if (signedIn) {
        // Not awaited — the optimistic patch in cartApi has already updated
        // the cache, and a failure undoes it.
        void upsertCartItem({ productId: line.productId, quantity: clamped, line });
        return;
      }

      dispatch(
        setItemQuantity({
          productId: line.productId,
          quantity: clamped,
          name: line.name,
          price: line.price,
          unit: line.unit,
          imageUrl: line.imageUrl,
          minQty: line.minQty,
          maxQty: line.maxQty,
        })
      );
    },
    [signedIn, upsertCartItem, dispatch]
  );

  const remove = useCallback(
    (line: CartLineMeta) => {
      setQuantity(line, 0);
    },
    [setQuantity]
  );

  const clear = useCallback(() => {
    if (!signedIn) {
      dispatch(clearGuestCart());
      return;
    }
    // No bulk-delete endpoint exists (contracts/cart-api.md); the per-item
    // PUTs each patch the same cache optimistically, so the list still empties
    // in one frame.
    for (const line of items) {
      void upsertCartItem({ productId: line.productId, quantity: 0 });
    }
  }, [signedIn, dispatch, items, upsertCartItem]);

  const loading =
    resolvingAuth || (signedIn ? serverLoading && !serverCart : !guestHydrated);

  return {
    signedIn,
    loading,
    items,
    itemCount,
    subtotal,
    quantityOf,
    setQuantity,
    remove,
    clear,
  };
}

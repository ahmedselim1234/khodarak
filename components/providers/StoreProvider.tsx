"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { hydrate, type GuestCartItem } from "@/lib/cart/cartSlice";

const GUEST_CART_STORAGE_KEY = "khodarak.guestCart";

// Pushed to a leaf provider, not the root layout wholesale — only the
// address book, admin product forms, and now the cart need Redux; every
// other route stays a Server Component with no client bundle cost.
export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Hydrate the guest cart from localStorage on mount (T034/T037) — no
    // redux-persist dependency, just one read/write on one key.
    try {
      const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as Record<string, GuestCartItem>;
        store.dispatch(hydrate(items));
      } else {
        store.dispatch(hydrate({}));
      }
    } catch {
      store.dispatch(hydrate({}));
    }

    const unsubscribe = store.subscribe(() => {
      const { cart } = store.getState();
      if (!cart.hydrated) return;
      try {
        window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch {
        // Storage unavailable (private browsing, quota) — the cart still
        // works in-memory for the current page load.
      }
    });

    return unsubscribe;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

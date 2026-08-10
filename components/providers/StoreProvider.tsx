"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";

// Pushed to a leaf provider, not the root layout wholesale — only the
// address book (and later, cart/subscription state) needs the Redux store;
// every other route stays a Server Component with no client bundle cost.
export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

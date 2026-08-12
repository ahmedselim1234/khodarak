import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type GuestCartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  minQty: number;
  maxQty: number;
};

export type CartState = {
  items: Record<string, GuestCartItem>;
  hydrated: boolean;
};

const initialState: CartState = { items: {}, hydrated: false };

// Guest (signed-out) cart — device-local, mirrored to localStorage by
// StoreProvider. Cleared once its contents are merged into the account's
// server-side cart at login (data-model.md, contracts/cart-api.md).
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<Record<string, GuestCartItem>>) {
      // `minQty` was added to GuestCartItem after this key shipped, so a cart
      // persisted by an older build has no value for it. Normalize on read
      // rather than letting `undefined` reach clampQuantity.
      const normalized: Record<string, GuestCartItem> = {};
      for (const [id, item] of Object.entries(action.payload ?? {})) {
        if (!item || typeof item.productId !== "string") continue;
        normalized[id] = { ...item, minQty: item.minQty ?? 1, maxQty: item.maxQty ?? 99 };
      }
      state.items = normalized;
      state.hydrated = true;
    },
    setItemQuantity(state, action: PayloadAction<GuestCartItem>) {
      if (action.payload.quantity <= 0) {
        delete state.items[action.payload.productId];
      } else {
        state.items[action.payload.productId] = action.payload;
      }
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      delete state.items[action.payload.productId];
    },
    clearCart(state) {
      state.items = {};
    },
  },
});

export const { hydrate, setItemQuantity, removeItem, clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export function selectGuestCartItems(state: { cart: CartState }): GuestCartItem[] {
  return Object.values(state.cart.items);
}

export function selectGuestCartCount(state: { cart: CartState }): number {
  return Object.values(state.cart.items).reduce((sum, item) => sum + item.quantity, 0);
}

export function selectGuestCartTotal(state: { cart: CartState }): number {
  return Object.values(state.cart.items).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

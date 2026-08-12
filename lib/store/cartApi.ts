import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type CartLine = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  isAvailable: boolean;
  minQty: number;
  maxQty: number;
};

// Everything about a line except how many of it are in the cart. Passed
// alongside an upsert so the optimistic patch can *insert* a brand-new line
// (not just bump an existing one) before the server has answered.
export type CartLineMeta = Omit<CartLine, "quantity">;

export type CartResponse = {
  items: CartLine[];
  itemCount: number;
  total: number;
};

function recomputeTotals(draft: CartResponse) {
  draft.itemCount = draft.items.reduce((sum, item) => sum + item.quantity, 0);
  draft.total = draft.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyQuantity(
  draft: CartResponse,
  productId: string,
  quantity: number,
  line?: CartLineMeta
) {
  const index = draft.items.findIndex((item) => item.productId === productId);

  if (quantity <= 0) {
    if (index >= 0) draft.items.splice(index, 1);
  } else if (index >= 0) {
    draft.items[index].quantity = quantity;
  } else if (line) {
    draft.items.push({ ...line, quantity });
  }

  recomputeTotals(draft);
}

// Signed-in customer's server-synced cart, against /api/cart/* per
// contracts/cart-api.md — same pattern as lib/store/addressesApi.ts.
//
// Writes are optimistic: `upsertCartItem` patches the `getCart` cache the
// moment the button is pressed and rolls the patch back if the request
// fails, so a stepper press never waits on a round trip. It deliberately
// does NOT invalidate the "Cart" tag — the PUT response already returns the
// authoritative (server-clamped) quantity, so re-fetching the whole cart
// after every tap would be a second round trip for information already in
// hand. `mergeCart` still invalidates, because its response doesn't
// describe the resulting cart.
export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/cart" }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => "",
      providesTags: [{ type: "Cart", id: "SELF" }],
    }),
    upsertCartItem: builder.mutation<
      { productId: string; quantity: number },
      { productId: string; quantity: number; line?: CartLineMeta }
    >({
      query: ({ productId, quantity }) => ({
        url: `/items/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      async onQueryStarted({ productId, quantity, line }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            applyQuantity(draft, productId, quantity, line);
          })
        );

        try {
          const { data } = await queryFulfilled;
          // The server clamps to [minQty, maxQty] and is authoritative; if it
          // landed somewhere other than what we guessed, correct the cache in
          // place rather than refetching it.
          if (data.quantity !== quantity) {
            dispatch(
              cartApi.util.updateQueryData("getCart", undefined, (draft) => {
                applyQuantity(draft, productId, data.quantity, line);
              })
            );
          }
        } catch {
          patch.undo();
        }
      },
    }),
    mergeCart: builder.mutation<
      { merged: number; skipped: number },
      { items: Array<{ productId: string; quantity: number }> }
    >({
      query: (body) => ({ url: "/merge", method: "POST", body }),
      invalidatesTags: [{ type: "Cart", id: "SELF" }],
    }),
  }),
});

export const { useGetCartQuery, useUpsertCartItemMutation, useMergeCartMutation } = cartApi;

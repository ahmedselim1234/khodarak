import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type CartLine = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  isAvailable: boolean;
  maxQty: number;
};

export type CartResponse = {
  items: CartLine[];
  itemCount: number;
  total: number;
};

// Signed-in customer's server-synced cart, against /api/cart/* per
// contracts/cart-api.md — same pattern as lib/store/addressesApi.ts.
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
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/items/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: [{ type: "Cart", id: "SELF" }],
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

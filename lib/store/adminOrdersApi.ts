import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { OrderStatus } from "@/lib/orders/orderStatusTransition";

// Admin order status mutations against /api/admin/orders, following the
// productsAdminApi.ts pattern from Phase 2.
export const adminOrdersApi = createApi({
  reducerPath: "adminOrdersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/orders" }),
  endpoints: (builder) => ({
    updateOrderStatus: builder.mutation<{ status: OrderStatus }, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/${id}`, method: "PATCH", body: { status } }),
    }),
  }),
});

export const { useUpdateOrderStatusMutation } = adminOrdersApi;

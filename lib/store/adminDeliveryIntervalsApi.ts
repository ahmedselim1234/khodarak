import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AdminDeliveryInterval = {
  id: string;
  days: number;
  discountPercent: number;
  isActive: boolean;
};

export type DeliveryIntervalCreateRequest = {
  days: number;
  discountPercent: number;
};

export type DeliveryIntervalUpdateRequest = {
  discountPercent?: number;
  isActive?: boolean;
};

// Admin delivery-interval mutations against /api/admin/delivery-intervals,
// mirroring adminCitiesApi.ts's exact shape (Phase 8's closest precedent).
export const adminDeliveryIntervalsApi = createApi({
  reducerPath: "adminDeliveryIntervalsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/delivery-intervals" }),
  endpoints: (builder) => ({
    createInterval: builder.mutation<AdminDeliveryInterval, DeliveryIntervalCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { interval: AdminDeliveryInterval }) => response.interval,
    }),
    updateInterval: builder.mutation<
      AdminDeliveryInterval,
      { id: string; body: DeliveryIntervalUpdateRequest }
    >({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { interval: AdminDeliveryInterval }) => response.interval,
    }),
  }),
});

export const { useCreateIntervalMutation, useUpdateIntervalMutation } = adminDeliveryIntervalsApi;

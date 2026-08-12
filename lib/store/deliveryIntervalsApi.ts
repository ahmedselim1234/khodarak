import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type DeliveryInterval = {
  id: string;
  days: number;
  discountPercent: number;
  estimatedDeliveriesPerMonth: number;
};

// Public read against /api/delivery-intervals, per
// contracts/delivery-intervals-public-api.md — active intervals only, the
// only source of frequency options a customer sees in the builder (FR-005)
// and the dashboard's change-interval control (FR-009).
export const deliveryIntervalsApi = createApi({
  reducerPath: "deliveryIntervalsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/delivery-intervals" }),
  endpoints: (builder) => ({
    listDeliveryIntervals: builder.query<DeliveryInterval[], void>({
      query: () => "",
      transformResponse: (response: { intervals: DeliveryInterval[] }) => response.intervals,
    }),
  }),
});

export const { useListDeliveryIntervalsQuery } = deliveryIntervalsApi;

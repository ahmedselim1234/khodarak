import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TimeSlotId } from "@/lib/subscription/timeSlots";

// FR-005: a new subscription only ever carries a deliveryIntervalId — no
// legacy frequency is accepted for creation (Phase 10).
export type SubscriptionCreateRequest = {
  deliveryIntervalId: string;
  addressId: string;
  nextDeliveryDate: string;
  deliveryTimeSlot: TimeSlotId;
};

export type SubscriptionCreateResponse = { subscriptionId: string };

// Create mutation against /api/subscriptions, per contracts/subscriptions-api.md
// — mirrors lib/store/addressesApi.ts's mutation shape.
export const subscriptionsApi = createApi({
  reducerPath: "subscriptionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/subscriptions" }),
  endpoints: (builder) => ({
    createSubscription: builder.mutation<SubscriptionCreateResponse, SubscriptionCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
    }),
  }),
});

export const { useCreateSubscriptionMutation } = subscriptionsApi;

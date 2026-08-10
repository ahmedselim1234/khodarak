import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";
import type { TimeSlotId } from "@/lib/subscription/timeSlots";

export type SubscriptionCreateRequest = {
  frequency: FrequencyKey;
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

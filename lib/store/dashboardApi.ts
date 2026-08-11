import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

export type SubscriptionItem = {
  productId: string;
  productNameAr: string;
  quantity: number;
  unitPrice: number;
};

export type SubscriptionPendingChange = {
  frequency: FrequencyKey;
  addressId: string;
  items: SubscriptionItem[];
  priceBreakdown: PriceBreakdown;
  effectiveFrom: string;
};

export type SubscriptionDetail = {
  id: string;
  status: "pending_payment" | "active" | "paused" | "cancelled";
  frequency: FrequencyKey;
  nextDeliveryDate: string;
  pausedUntil: string | null;
  insideEditCutoff: boolean;
  items: SubscriptionItem[];
  priceBreakdown: PriceBreakdown;
  addressId: string;
  pendingChange: SubscriptionPendingChange | null;
  health: "good" | "needs_attention";
};

export type SubscriptionEditRequest = {
  items: Array<{ productId: string; quantity: number }>;
  frequency: FrequencyKey;
  addressId: string;
};

export type SubscriptionEditResponse =
  | { applied: "immediately"; priceBreakdown: PriceBreakdown; nextDeliveryDate: string }
  | { applied: "pending"; effectiveFrom: string; priceBreakdown: PriceBreakdown };

// The dashboard's one live-updating data slice — per
// contracts/subscription-detail-and-edit-api.md and
// contracts/pause-resume-cancel-api.md. Every mutation invalidates the
// "Subscription" tag so SubscriptionDashboard.tsx's status card, health
// badge, and pending-change banner all update in place without a page
// reload (SC-005).
export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/subscriptions" }),
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    getSubscription: builder.query<SubscriptionDetail, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Subscription", id }],
    }),
    editSubscription: builder.mutation<
      SubscriptionEditResponse,
      { id: string; body: SubscriptionEditRequest }
    >({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Subscription", id }],
    }),
    pauseSubscription: builder.mutation<
      { status: string; pausedUntil: string },
      { id: string; resumeDate: string }
    >({
      query: ({ id, resumeDate }) => ({
        url: `/${id}/pause`,
        method: "POST",
        body: { resumeDate },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Subscription", id }],
    }),
    resumeSubscription: builder.mutation<{ status: string; nextDeliveryDate: string }, string>({
      query: (id) => ({ url: `/${id}/resume`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Subscription", id }],
    }),
    cancelSubscription: builder.mutation<{ status: string }, string>({
      query: (id) => ({ url: `/${id}/cancel`, method: "POST", body: { confirm: true } }),
      invalidatesTags: (_result, _error, id) => [{ type: "Subscription", id }],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useEditSubscriptionMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
} = dashboardApi;

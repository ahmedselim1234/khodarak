import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Admin subscription pause/cancel mutations against /api/admin/subscriptions,
// following the productsAdminApi.ts pattern from Phase 2.
export const adminSubscriptionsApi = createApi({
  reducerPath: "adminSubscriptionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/subscriptions" }),
  endpoints: (builder) => ({
    adminPauseSubscription: builder.mutation<
      { status: string; pausedUntil: string | null },
      { id: string; reason: string; resumeDate?: string | null }
    >({
      query: ({ id, reason, resumeDate }) => ({
        url: `/${id}/pause`,
        method: "POST",
        body: { reason, resumeDate },
      }),
    }),
    adminCancelSubscription: builder.mutation<{ status: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/${id}/cancel`, method: "POST", body: { reason } }),
    }),
  }),
});

export const { useAdminPauseSubscriptionMutation, useAdminCancelSubscriptionMutation } =
  adminSubscriptionsApi;

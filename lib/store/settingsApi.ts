import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ReplacePaymentMethodResponse = {
  id: string;
  brand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
};

export type ProfileUpdateRequest = { fullName: string; phone: string };
export type ProfileUpdateResponse = { fullName: string; phone: string };

// Settings-page mutations only (contracts/settings-api.md's Notes: reads
// stay on direct Server Component Supabase queries — see
// components/dashboard/settings/*.tsx — each dialog here calls
// `router.refresh()` on success instead of maintaining its own query cache
// for a value that only ever changes from that one dialog).
export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    replacePaymentMethod: builder.mutation<ReplacePaymentMethodResponse, { moyasarPaymentId: string }>({
      query: (body) => ({ url: "/payment-methods", method: "POST", body }),
    }),
    updateProfile: builder.mutation<ProfileUpdateResponse, ProfileUpdateRequest>({
      query: (body) => ({ url: "/profile", method: "PATCH", body }),
    }),
  }),
});

export const { useReplacePaymentMethodMutation, useUpdateProfileMutation } = settingsApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Frequencies, DeliveryMode, RoundingMode } from "@/lib/pricing/mapSettingsRow";

export type Settings = {
  frequencies: Frequencies;
  minOrderValue: number;
  maxItemsPerBox: number;
  editCutoffHours: number;
  firstDeliveryLeadDays: number;
  blackoutWeekdays: number[];
  deliveryMode: DeliveryMode;
  deliveryFlatFee: number;
  deliveryFreeThreshold: number;
  maxPauseDays: number;
  maxPausesPerYear: number;
  vatPercent: number;
  pricesIncludeVat: boolean;
  roundingMode: RoundingMode;
  updatedAt: string;
};

export type SettingsUpdateRequest = Partial<Omit<Settings, "updatedAt" | "frequencies">> & {
  // A partial frequencies update only needs to name the key(s) being
  // changed — the Route Handler merges it with the existing row
  // (contracts/settings-admin-api.md), so each key is itself optional here.
  frequencies?: Partial<Frequencies>;
};

// Admin settings mutations against /api/admin/settings, following the
// productsAdminApi.ts pattern from Phase 2.
export const settingsAdminApi = createApi({
  reducerPath: "settingsAdminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/settings" }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => "",
      transformResponse: (response: { settings: Settings }) => response.settings,
      providesTags: [{ type: "Settings", id: "SELF" }],
    }),
    updateSettings: builder.mutation<Settings, SettingsUpdateRequest>({
      query: (body) => ({ url: "", method: "PATCH", body }),
      transformResponse: (response: { settings: Settings }) => response.settings,
      invalidatesTags: [{ type: "Settings", id: "SELF" }],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsAdminApi;

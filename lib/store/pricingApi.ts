import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FrequencyKey } from "@/lib/pricing/mapSettingsRow";
import type { PriceBreakdown } from "@/lib/pricing/calculate";

export type PricingPreviewRequest = {
  items: Array<{ productId: string; quantity: number }>;
  frequency: FrequencyKey;
  cityId: string;
};

// Public pricing preview against /api/pricing/preview, per
// contracts/pricing-preview-api.md. Modeled as a query (not a mutation) even
// though the Route Handler is a POST — it has no side effects, and RTK
// Query's query cache/dedup behavior fits a "recompute on selection change"
// UI better than a mutation would (research.md §3 — this call is what keeps
// the client from ever computing a price itself).
export const pricingApi = createApi({
  reducerPath: "pricingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/pricing" }),
  endpoints: (builder) => ({
    previewPrice: builder.query<{ breakdown: PriceBreakdown }, PricingPreviewRequest>({
      query: (body) => ({ url: "/preview", method: "POST", body }),
    }),
  }),
});

export const { useLazyPreviewPriceQuery } = pricingApi;

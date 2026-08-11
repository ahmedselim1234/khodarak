import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AdminCity = {
  id: string;
  nameAr: string;
  isActive: boolean;
  deliveryFeeOverride: number | null;
};

export type CityCreateRequest = {
  nameAr: string;
  isActive?: boolean;
  deliveryFeeOverride?: number | null;
};

export type CityUpdateRequest = Partial<CityCreateRequest>;

// Admin city mutations against /api/admin/cities, following the
// productsAdminApi.ts pattern from Phase 2.
export const adminCitiesApi = createApi({
  reducerPath: "adminCitiesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/cities" }),
  endpoints: (builder) => ({
    createCity: builder.mutation<AdminCity, CityCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { city: AdminCity }) => response.city,
    }),
    updateCity: builder.mutation<AdminCity, { id: string; body: CityUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { city: AdminCity }) => response.city,
    }),
  }),
});

export const { useCreateCityMutation, useUpdateCityMutation } = adminCitiesApi;

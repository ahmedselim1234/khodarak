import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ProductCategory, ProductUnit } from "@/lib/products/mapProductRow";

export type AdminProduct = {
  id: string;
  nameAr: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  imageUrl: string;
  isAvailable: boolean;
  minQty: number;
  maxQty: number;
  createdAt: string;
};

export type ProductCreateRequest = {
  nameAr: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  imageUrl: string;
  minQty: number;
  maxQty: number;
};

export type ProductUpdateRequest = Partial<ProductCreateRequest> & { isAvailable?: boolean };

// Admin product mutations against /api/admin/products, following the
// addressesApi.ts pattern from Phase 1.
export const productsAdminApi = createApi({
  reducerPath: "productsAdminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/products" }),
  tagTypes: ["AdminProduct"],
  endpoints: (builder) => ({
    createProduct: builder.mutation<AdminProduct, ProductCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { product: AdminProduct }) => response.product,
      invalidatesTags: [{ type: "AdminProduct", id: "LIST" }],
    }),
    updateProduct: builder.mutation<AdminProduct, { id: string; body: ProductUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { product: AdminProduct }) => response.product,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "AdminProduct", id: "LIST" }],
    }),
  }),
});

export const { useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } =
  productsAdminApi;

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
  sortOrder: number;
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
  sortOrder?: number;
};

export type ProductUpdateRequest = Partial<ProductCreateRequest> & { isAvailable?: boolean };

// Prefix makes an in-flight optimistic row obvious in the devtools, matching
// addressesApi's convention.
const OPTIMISTIC_ID_PREFIX = "optimistic:";

// Admin product mutations against /api/admin/products, following the
// addressesApi.ts optimistic-cache pattern: every mutation patches the
// listProducts cache via onQueryStarted before the request resolves, and
// undoes the patch if it fails.
export const productsAdminApi = createApi({
  reducerPath: "productsAdminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin/products" }),
  tagTypes: ["AdminProduct"],
  endpoints: (builder) => ({
    listProducts: builder.query<AdminProduct[], void>({
      query: () => "",
      transformResponse: (response: { products: AdminProduct[] }) => response.products,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "AdminProduct" as const, id })),
              { type: "AdminProduct" as const, id: "LIST" },
            ]
          : [{ type: "AdminProduct" as const, id: "LIST" }],
    }),
    createProduct: builder.mutation<AdminProduct, ProductCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { product: AdminProduct }) => response.product,
      invalidatesTags: [{ type: "AdminProduct", id: "LIST" }],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const optimistic: AdminProduct = {
          id: `${OPTIMISTIC_ID_PREFIX}${Date.now()}`,
          nameAr: body.nameAr,
          category: body.category,
          price: body.price,
          unit: body.unit,
          imageUrl: body.imageUrl,
          isAvailable: true,
          minQty: body.minQty,
          maxQty: body.maxQty,
          sortOrder: body.sortOrder ?? 0,
          createdAt: new Date().toISOString(),
        };

        const patch = dispatch(
          productsAdminApi.util.updateQueryData("listProducts", undefined, (draft) => {
            draft.push(optimistic);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    updateProduct: builder.mutation<AdminProduct, { id: string; body: ProductUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { product: AdminProduct }) => response.product,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
      ],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          productsAdminApi.util.updateQueryData("listProducts", undefined, (draft) => {
            const target = draft.find((product) => product.id === id);
            if (!target) return;
            Object.assign(target, body);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "AdminProduct", id: "LIST" }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          productsAdminApi.util.updateQueryData("listProducts", undefined, (draft) => {
            const index = draft.findIndex((product) => product.id === id);
            if (index >= 0) draft.splice(index, 1);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsAdminApi;

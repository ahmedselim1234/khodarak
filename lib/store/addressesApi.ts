import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Address = {
  id: string;
  label: string;
  cityId: string;
  cityName: string;
  district: string;
  streetDetails: string;
  isDefault: boolean;
  createdAt: string;
};

export type AddressCreateRequest = {
  label: string;
  cityId: string;
  district: string;
  streetDetails: string;
};

export type AddressUpdateRequest = Partial<AddressCreateRequest> & { isDefault?: true };

// First RTK Query slice in the project — the client data layer plan.md
// commits to for later phases (cart, subscription) against /api/*.
export const addressesApi = createApi({
  reducerPath: "addressesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/addresses" }),
  tagTypes: ["Address"],
  endpoints: (builder) => ({
    listAddresses: builder.query<Address[], void>({
      query: () => "",
      transformResponse: (response: { addresses: Address[] }) => response.addresses,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Address" as const, id })),
              { type: "Address" as const, id: "LIST" },
            ]
          : [{ type: "Address" as const, id: "LIST" }],
    }),
    createAddress: builder.mutation<Address, AddressCreateRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { address: Address }) => response.address,
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
    updateAddress: builder.mutation<Address, { id: string; body: AddressUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { address: Address }) => response.address,
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
  }),
});

export const {
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;

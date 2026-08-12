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

// Prefix makes an in-flight optimistic row obvious in the devtools and, more
// importantly, lets the UI tell "saved" rows from "saving" ones if it ever
// needs to.
const OPTIMISTIC_ID_PREFIX = "optimistic:";

export function isOptimisticAddressId(id: string) {
  return id.startsWith(OPTIMISTIC_ID_PREFIX);
}

// First RTK Query slice in the project — the client data layer plan.md
// commits to for later phases (cart, subscription) against /api/*.
//
// All three mutations patch the `listAddresses` cache before the request
// leaves, and undo the patch if it fails. They still invalidate the LIST tag
// on success so the server's own version (real id, server timestamps, the
// default-flag invariant enforced in lib/addresses/defaultInvariant.ts)
// replaces the guess a moment later.
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
    createAddress: builder.mutation<
      Address,
      // `cityName` is display-only and never sent to the server — it exists so
      // the optimistic row can render the city the user just picked instead of
      // a blank cell until the refetch lands.
      { body: AddressCreateRequest; cityName?: string }
    >({
      query: ({ body }) => ({ url: "", method: "POST", body }),
      transformResponse: (response: { address: Address }) => response.address,
      invalidatesTags: [{ type: "Address", id: "LIST" }],
      async onQueryStarted({ body, cityName }, { dispatch, queryFulfilled }) {
        const optimistic: Address = {
          id: `${OPTIMISTIC_ID_PREFIX}${Date.now()}`,
          label: body.label,
          cityId: body.cityId,
          cityName: cityName ?? "",
          district: body.district,
          streetDetails: body.streetDetails,
          // The server marks the very first address default; guessing `false`
          // here is the safe direction — the refetch corrects it either way.
          isDefault: false,
          createdAt: new Date().toISOString(),
        };

        const patch = dispatch(
          addressesApi.util.updateQueryData("listAddresses", undefined, (draft) => {
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
    updateAddress: builder.mutation<Address, { id: string; body: AddressUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      transformResponse: (response: { address: Address }) => response.address,
      invalidatesTags: [{ type: "Address", id: "LIST" }],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          addressesApi.util.updateQueryData("listAddresses", undefined, (draft) => {
            const target = draft.find((address) => address.id === id);
            if (!target) return;

            Object.assign(target, body);

            // Exactly one address is default at a time (defaultInvariant.ts).
            // Mirroring that here keeps the badge from briefly showing on two
            // cards at once.
            if (body.isDefault) {
              for (const address of draft) {
                address.isDefault = address.id === id;
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          addressesApi.util.updateQueryData("listAddresses", undefined, (draft) => {
            const index = draft.findIndex((address) => address.id === id);
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
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;

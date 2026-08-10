import { configureStore } from "@reduxjs/toolkit";
import { addressesApi } from "./addressesApi";
import { productsAdminApi } from "./productsAdminApi";
import { cartApi } from "./cartApi";
import { cartReducer } from "@/lib/cart/cartSlice";

export const store = configureStore({
  reducer: {
    [addressesApi.reducerPath]: addressesApi.reducer,
    [productsAdminApi.reducerPath]: productsAdminApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      addressesApi.middleware,
      productsAdminApi.middleware,
      cartApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

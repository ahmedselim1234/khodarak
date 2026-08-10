import { configureStore } from "@reduxjs/toolkit";
import { addressesApi } from "./addressesApi";
import { productsAdminApi } from "./productsAdminApi";
import { cartApi } from "./cartApi";
import { settingsAdminApi } from "./settingsAdminApi";
import { pricingApi } from "./pricingApi";
import { subscriptionsApi } from "./subscriptionsApi";
import { cartReducer } from "@/lib/cart/cartSlice";

export const store = configureStore({
  reducer: {
    [addressesApi.reducerPath]: addressesApi.reducer,
    [productsAdminApi.reducerPath]: productsAdminApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [settingsAdminApi.reducerPath]: settingsAdminApi.reducer,
    [pricingApi.reducerPath]: pricingApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      addressesApi.middleware,
      productsAdminApi.middleware,
      cartApi.middleware,
      settingsAdminApi.middleware,
      pricingApi.middleware,
      subscriptionsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

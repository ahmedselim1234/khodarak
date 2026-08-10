import { configureStore } from "@reduxjs/toolkit";
import { addressesApi } from "./addressesApi";

export const store = configureStore({
  reducer: {
    [addressesApi.reducerPath]: addressesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(addressesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

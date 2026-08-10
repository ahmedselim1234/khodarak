import { configureStore } from "@reduxjs/toolkit";

// Scaffold only — no slices with real business logic yet. Later phases add
// slices here (e.g. cart state in Phase 2) rather than inventing a second
// store location.
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

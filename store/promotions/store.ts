import { configureStore } from "@reduxjs/toolkit";
import promotionsReducer from "./promotionsSlice";

export const promotionsStore = configureStore({
  reducer: {
    promotions: promotionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof promotionsStore.getState>;
export type AppDispatch = typeof promotionsStore.dispatch;

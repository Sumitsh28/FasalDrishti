import { configureStore } from "@reduxjs/toolkit";
import plantsReducer from "./plantsSlice";

export const store = configureStore({
  reducer: {
    plants: plantsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

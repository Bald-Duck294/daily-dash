import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/auth.slice.js";
import uiReducer from "./slices/ui.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

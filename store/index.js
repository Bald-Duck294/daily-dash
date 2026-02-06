import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/auth.slice.js";
import uiReducer from "./slices/ui.slice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import { notificationApi } from "@/features/notification/notification.api";
import notificationReducer from "@/features/notification/notification.slice";
export const store = configureStore({
  reducer: {  
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },    
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(
        // configurationApi.middleware,
        //   reviewApi.middleware,
        //   shiftApi.middleware,
          notificationApi.middleware
      ),
});







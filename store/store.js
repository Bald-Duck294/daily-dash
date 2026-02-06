import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import authReducer from "@/features/auth/auth.slice.js";
// import { configurationApi } from './slices/configurationApi';
// import { reviewApi } from './slices/reviewSlice';
// import { shiftApi } from "./slices/shiftApi.js";
// import { notificationApi } from './slices/notificationApi';
// import notificationReducer from './slices/notificationSlice';
import notificationReducer from "@/features/notification/notification.slice";
import { notificationApi } from "@/features/notification/notification.api";
// ✅ Persist config for auth only
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "isAuthenticated"], // only persist these fields
};

// ✅ Wrap auth reducer with persistReducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
console.log("in main store");
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: notificationReducer,
    // [configurationApi.reducerPath]: configurationApi.reducer,
    // [reviewApi.reducerPath]: reviewApi.reducer,
    // [shiftApi.reducerPath]: shiftApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },


  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat
      //   configurationApi.middleware,
      //   reviewApi.middleware,
      //   shiftApi.middleware,
      //   notificationApi.middleware
      (),
});

// ✅ Create persistor
export const persistor = persistStore(store);

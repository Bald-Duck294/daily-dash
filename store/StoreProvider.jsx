"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store"; // ← Import BOTH store and persistor

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      {/* ✅ Add PersistGate for redux-persist */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

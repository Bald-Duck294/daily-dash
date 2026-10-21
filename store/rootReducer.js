import { combineReducers } from "@reduxjs/toolkit";
import uiReducer from "./slices/ui.slice";
import feedbackReducer from "@/features/feedback/feedback.slice";

export const rootReducer = combineReducers({
  ui: uiReducer,
  feedback: feedbackReducer,
});

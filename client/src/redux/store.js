import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { questionsApi } from "./api/QuestionsApi";
import userReducer from "./features/userSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [questionsApi.reducerPath]: questionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware,
      questionsApi.middleware,
    ]),
});

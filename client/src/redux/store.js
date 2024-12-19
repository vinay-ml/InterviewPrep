import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import useReducer from "./features/userSlice";

export const store = configureStore({
  reducer: {
    auth: useReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([authApi.middleware]),
});

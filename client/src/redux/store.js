import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { javascriptTheoryQuestionsApi } from "./api/javascriptTheoryQuestionsApi";
import userReducer from "./features/userSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [javascriptTheoryQuestionsApi.reducerPath]:
      javascriptTheoryQuestionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware,
      javascriptTheoryQuestionsApi.middleware,
    ]),
});

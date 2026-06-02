import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { questionsApi } from './api/QuestionsApi';
import { navigationApi } from './api/navigationApi';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [questionsApi.reducerPath]: questionsApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware,
      questionsApi.middleware,
      navigationApi.middleware,
    ]),
});

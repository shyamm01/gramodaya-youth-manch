import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { gymApi } from './services/gymApi';
import authReducer from './slices/authSlice';
import villageReducer from './slices/villageSlice';
import uiReducer from './slices/uiSlice';
import communityReducer from './slices/communitySlice';

export const store = configureStore({
  reducer: {
    [gymApi.reducerPath]: gymApi.reducer,
    auth: authReducer,
    village: villageReducer,
    ui: uiReducer,
    community: communityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(gymApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

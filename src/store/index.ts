import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import villageReducer from './slices/villageSlice';
import uiReducer from './slices/uiSlice';
import communityReducer from './slices/communitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    village: villageReducer,
    ui: uiReducer,
    community: communityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

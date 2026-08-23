import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import villageReducer from './slices/villageSlice';
import homeReducer from './slices/homeSlice';
import uiReducer from './slices/uiSlice';
import communityReducer from './slices/communitySlice';
import membersReducer from './slices/membersSlice';
import complaintsReducer from './slices/complaintsSlice';
import socialWorksReducer from './slices/socialWorksSlice';
import eventsReducer from './slices/eventsSlice';
import galleryReducer from './slices/gallerySlice';
import announcementsReducer from './slices/announcementsSlice';
import publicInfoReducer from './slices/publicInfoSlice';
import eldersReducer from './slices/eldersSlice';
import leadershipReducer from './slices/leadershipSlice';
import chatReducer from './slices/chatSlice';
import permissionsReducer from './slices/permissionsSlice';
import adminUiReducer from './slices/adminUiSlice';
import { adminApi } from './api/adminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    village: villageReducer,
    home: homeReducer,
    ui: uiReducer,
    community: communityReducer,
    members: membersReducer,
    complaints: complaintsReducer,
    socialWorks: socialWorksReducer,
    events: eventsReducer,
    gallery: galleryReducer,
    announcements: announcementsReducer,
    publicInfo: publicInfoReducer,
    elders: eldersReducer,
    leadership: leadershipReducer,
    chat: chatReducer,
    permissions: permissionsReducer,
    adminUi: adminUiReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(adminApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enables refetchOnReconnect and the cache-lifetime timers RTK Query uses to
// drop entries no mounted component is subscribed to any more.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

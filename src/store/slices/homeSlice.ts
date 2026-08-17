import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export type CardStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface CardState<T> {
  data: T | null;
  status: CardStatus;
  error: string | null;
}

const emptyCard = <T>(): CardState<T> => ({ data: null, status: 'idle', error: null });

// Every home page card owns its own state, independently of the others — one
// card's slow query or failure never blocks or fails another card. Each thunk
// below hits a generic, village-scoped API (/api/stats, /api/announcements,
// etc.) also used elsewhere in the app (their own full-list pages) — nothing
// here is a home-page-specific endpoint, just a home-page-specific *view* of
// shared data (see app/api/stats/route.ts, app/api/announcements/route.ts, …).
export interface HomeState {
  stats: CardState<{ village: any; stats: any }>;
  announcements: CardState<{ announcements: any[] }>;
  events: CardState<{ events: any[] }>;
  socialWork: CardState<{ socialWorks: any[] }>;
  gallery: CardState<{ gallery: any[] }>;
}

const initialState: HomeState = {
  stats: emptyCard(),
  announcements: emptyCard(),
  events: emptyCard(),
  socialWork: emptyCard(),
  gallery: emptyCard(),
};

const notAlreadyLoaded = (status: CardStatus) => status !== 'loading' && status !== 'succeeded';

// Every thunk below shares the same shape: hit a generic API endpoint (no
// villageId argument — the server derives it from the auth token, see
// src/lib/villageContext.ts), and use RTK's `condition` (checks live store
// state via getState, not a component's captured closure) to dedupe React
// StrictMode's dev-mode double-effect-invoke.

export const fetchHomeStats = createAsyncThunk(
  'home/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/stats');
      if (!data?.success) return rejectWithValue(data?.error || 'आंकड़े लोड करने में त्रुटि हुई।');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  },
  { condition: (_, { getState }) => notAlreadyLoaded((getState() as RootState).home.stats.status) }
);

export const fetchHomeAnnouncements = createAsyncThunk(
  'home/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/announcements', { headers: { 'X-Limit': '5' } });
      if (!data?.success) return rejectWithValue(data?.error || 'सूचनाएं लोड करने में त्रुटि हुई।');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  },
  { condition: (_, { getState }) => notAlreadyLoaded((getState() as RootState).home.announcements.status) }
);

export const fetchHomeEvents = createAsyncThunk(
  'home/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/events', { headers: { 'X-Limit': '3' } });
      if (!data?.success) return rejectWithValue(data?.error || 'कार्यक्रम लोड करने में त्रुटि हुई।');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  },
  { condition: (_, { getState }) => notAlreadyLoaded((getState() as RootState).home.events.status) }
);

export const fetchHomeSocialWork = createAsyncThunk(
  'home/fetchSocialWork',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/social-work', { headers: { 'X-Limit': '4' } });
      if (!data?.success) return rejectWithValue(data?.error || 'सामाजिक कार्य लोड करने में त्रुटि हुई।');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  },
  { condition: (_, { getState }) => notAlreadyLoaded((getState() as RootState).home.socialWork.status) }
);

export const fetchHomeGallery = createAsyncThunk(
  'home/fetchGallery',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/gallery', { headers: { 'X-Limit': '6' } });
      if (!data?.success) return rejectWithValue(data?.error || 'गैलरी लोड करने में त्रुटि हुई।');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  },
  { condition: (_, { getState }) => notAlreadyLoaded((getState() as RootState).home.gallery.status) }
);

function attachCardLifecycle<T>(
  builder: import('@reduxjs/toolkit').ActionReducerMapBuilder<HomeState>,
  key: keyof HomeState,
  thunk: ReturnType<typeof createAsyncThunk<any, void, any>>
) {
  builder
    .addCase(thunk.pending, (state) => {
      (state[key] as CardState<T>).status = 'loading';
      (state[key] as CardState<T>).error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      (state[key] as CardState<T>).status = 'succeeded';
      (state[key] as CardState<T>).data = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      (state[key] as CardState<T>).status = 'failed';
      (state[key] as CardState<T>).error =
        (action.payload as string) || action.error.message || 'Failed to load';
    });
}

export const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    attachCardLifecycle(builder, 'stats', fetchHomeStats);
    attachCardLifecycle(builder, 'announcements', fetchHomeAnnouncements);
    attachCardLifecycle(builder, 'events', fetchHomeEvents);
    attachCardLifecycle(builder, 'socialWork', fetchHomeSocialWork);
    attachCardLifecycle(builder, 'gallery', fetchHomeGallery);
  },
});

export default homeSlice.reducer;

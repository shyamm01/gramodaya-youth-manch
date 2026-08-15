import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { EventItem, EventStatus } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface EventsState {
  items: EventItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/events?villageId=${encodeURIComponent(villageId)}` : '/api/events';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.events)) {
        return data.events as EventItem[];
      }
      return (data?.events || []) as EventItem[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Partial<EventItem>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/events', eventData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to create event');
      }
      return data.event as EventItem;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string; eventData: Partial<EventItem> }, { rejectWithValue }) => {
    try {
      const data = await apiClient.patch(`/api/events/${id}`, eventData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update event');
      }
      return data.event as EventItem;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/events/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete event');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<EventItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export const { setEvents } = eventsSlice.actions;

// ── SELECTORS ──

export const selectAllEvents = (state: RootState) => state.events?.items || [];
export const selectEventsLoading = (state: RootState) => state.events?.status === 'loading';

export const selectPublishedEvents = createSelector(
  [selectAllEvents],
  (items) => items.filter((e) => e.status === 'PUBLISHED' || (e.status as string) === 'upcoming')
);

export default eventsSlice.reducer;

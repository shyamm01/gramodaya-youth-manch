import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Announcement } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface AnnouncementsState {
  items: Announcement[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AnnouncementsState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/announcements?villageId=${encodeURIComponent(villageId)}` : '/api/announcements';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.announcements)) {
        return data.announcements as Announcement[];
      }
      return (data?.announcements || []) as Announcement[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch announcements');
    }
  }
);

export const publishAnnouncement = createAsyncThunk(
  'announcements/publishAnnouncement',
  async (annData: { title: string; content: string; villageId?: string }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/announcements', annData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to publish announcement');
      }
      return data.announcement as Announcement;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/announcements/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete announcement');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(publishAnnouncement.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export const { setAnnouncements } = announcementsSlice.actions;

// ── SELECTORS ──

export const selectAllAnnouncements = (state: RootState) => state.announcements?.items || [];
export const selectAnnouncementsLoading = (state: RootState) => state.announcements?.status === 'loading';

export default announcementsSlice.reducer;

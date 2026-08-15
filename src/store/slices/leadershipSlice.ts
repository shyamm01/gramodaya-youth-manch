import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface LeadershipState {
  items: Admin[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LeadershipState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchLeadership = createAsyncThunk(
  'leadership/fetchLeadership',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/leadership?villageId=${encodeURIComponent(villageId)}` : '/api/leadership';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.leaders)) {
        return data.leaders as Admin[];
      }
      return (data?.leaders || []) as Admin[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch leadership');
    }
  }
);

// ── SLICE DEFINITION ──

export const leadershipSlice = createSlice({
  name: 'leadership',
  initialState,
  reducers: {
    setLeaders: (state, action: PayloadAction<Admin[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadership.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeadership.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLeadership.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setLeaders } = leadershipSlice.actions;

// ── SELECTORS ──

export const selectAllLeaders = (state: RootState) => state.leadership?.items || [];
export const selectLeadershipLoading = (state: RootState) => state.leadership?.status === 'loading';

export default leadershipSlice.reducer;

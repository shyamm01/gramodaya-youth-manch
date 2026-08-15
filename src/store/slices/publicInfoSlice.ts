import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { PublicInfo } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface PublicInfoState {
  items: PublicInfo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PublicInfoState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchPublicInfos = createAsyncThunk(
  'publicInfo/fetchPublicInfos',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/public-info?villageId=${encodeURIComponent(villageId)}` : '/api/public-info';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.publicInfos)) {
        return data.publicInfos as PublicInfo[];
      }
      return (data?.publicInfos || []) as PublicInfo[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch public info');
    }
  }
);

export const submitPublicInfo = createAsyncThunk(
  'publicInfo/submitPublicInfo',
  async (infoData: Partial<PublicInfo>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/public-info', infoData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to submit public info');
      }
      return data.publicInfo as PublicInfo;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePublicInfoStatus = createAsyncThunk(
  'publicInfo/updatePublicInfoStatus',
  async ({ id, status }: { id: string; status: 'approved' | 'pending' | 'rejected' }, { rejectWithValue }) => {
    try {
      const data = await apiClient.patch(`/api/public-info/${id}/status`, { status });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update public info status');
      }
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePublicInfo = createAsyncThunk(
  'publicInfo/deletePublicInfo',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/public-info/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete public info');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const publicInfoSlice = createSlice({
  name: 'publicInfo',
  initialState,
  reducers: {
    setPublicInfos: (state, action: PayloadAction<PublicInfo[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicInfos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPublicInfos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPublicInfos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(submitPublicInfo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePublicInfoStatus.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload.id);
        if (item) item.status = action.payload.status;
      })
      .addCase(deletePublicInfo.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { setPublicInfos } = publicInfoSlice.actions;

// ── SELECTORS ──

export const selectAllPublicInfos = (state: RootState) => state.publicInfo?.items || [];
export const selectPublicInfosLoading = (state: RootState) => state.publicInfo?.status === 'loading';

export const selectApprovedPublicInfos = createSelector(
  [selectAllPublicInfos],
  (items) => items.filter((i) => i.status === 'approved')
);

export const selectPendingPublicInfos = createSelector(
  [selectAllPublicInfos],
  (items) => items.filter((i) => i.status === 'pending')
);

export default publicInfoSlice.reducer;

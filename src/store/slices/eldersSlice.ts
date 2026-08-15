import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Elder } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface EldersState {
  items: Elder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: EldersState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchElders = createAsyncThunk(
  'elders/fetchElders',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/elders?villageId=${encodeURIComponent(villageId)}` : '/api/elders';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.elders)) {
        return data.elders as Elder[];
      }
      return (data?.elders || []) as Elder[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch elders');
    }
  }
);

export const addElder = createAsyncThunk(
  'elders/addElder',
  async (elderData: Partial<Elder>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/elders', elderData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to add elder');
      }
      return data.elder as Elder;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteElder = createAsyncThunk(
  'elders/deleteElder',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/elders/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete elder');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const eldersSlice = createSlice({
  name: 'elders',
  initialState,
  reducers: {
    setElders: (state, action: PayloadAction<Elder[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchElders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchElders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchElders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addElder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteElder.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export const { setElders } = eldersSlice.actions;

// ── SELECTORS ──

export const selectAllElders = (state: RootState) => state.elders?.items || [];
export const selectEldersLoading = (state: RootState) => state.elders?.status === 'loading';

export default eldersSlice.reducer;

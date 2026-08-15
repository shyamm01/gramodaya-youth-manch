import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { SocialWork } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface SocialWorksState {
  items: SocialWork[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SocialWorksState = {
  items: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchSocialWorks = createAsyncThunk(
  'socialWorks/fetchSocialWorks',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/social-work?villageId=${encodeURIComponent(villageId)}` : '/api/social-work';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.socialWorks)) {
        return data.socialWorks as SocialWork[];
      }
      return (data?.socialWorks || []) as SocialWork[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch social works');
    }
  }
);

export const submitSocialWork = createAsyncThunk(
  'socialWorks/submitSocialWork',
  async (workData: Partial<SocialWork>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/social-work', workData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to submit social work');
      }
      return data.socialWork as SocialWork;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSocialWorkStatus = createAsyncThunk(
  'socialWorks/updateSocialWorkStatus',
  async ({ id, status }: { id: string; status: 'approved' | 'pending' | 'published' }, { rejectWithValue }) => {
    try {
      const data = await apiClient.patch(`/api/social-work/${id}/status`, { status });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update social work status');
      }
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSocialWork = createAsyncThunk(
  'socialWorks/deleteSocialWork',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/social-work/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete social work');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const socialWorksSlice = createSlice({
  name: 'socialWorks',
  initialState,
  reducers: {
    setSocialWorks: (state, action: PayloadAction<SocialWork[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialWorks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSocialWorks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSocialWorks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(submitSocialWork.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateSocialWorkStatus.fulfilled, (state, action) => {
        const item = state.items.find((s) => s.id === action.payload.id);
        if (item) item.status = action.payload.status;
      })
      .addCase(deleteSocialWork.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export const { setSocialWorks } = socialWorksSlice.actions;

// ── SELECTORS ──

export const selectAllSocialWorks = (state: RootState) => state.socialWorks?.items || [];
export const selectSocialWorksLoading = (state: RootState) => state.socialWorks?.status === 'loading';

export const selectApprovedSocialWorks = createSelector(
  [selectAllSocialWorks],
  (items) => items.filter((s) => s.status === 'approved' || s.status === 'published')
);

export const selectPendingSocialWorks = createSelector(
  [selectAllSocialWorks],
  (items) => items.filter((s) => s.status === 'pending')
);

export default socialWorksSlice.reducer;

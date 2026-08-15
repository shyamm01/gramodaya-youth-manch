import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface ComplaintsState {
  items: Complaint[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedCategory: string;
}

const initialState: ComplaintsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedCategory: 'ALL',
};

// ── ASYNC THUNKS ──

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/complaints?villageId=${encodeURIComponent(villageId)}` : '/api/complaints';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.complaints)) {
        return data.complaints as Complaint[];
      }
      return (data?.complaints || []) as Complaint[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch complaints');
    }
  }
);

export const submitComplaint = createAsyncThunk(
  'complaints/submitComplaint',
  async (complaintData: Partial<Complaint>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/complaints', complaintData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to submit complaint');
      }
      return data.complaint as Complaint;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateComplaintStatus',
  async (
    { id, status }: { id: string; status: ComplaintStatus },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiClient.patch(`/api/complaints/${id}/status`, { status });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update complaint status');
      }
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/deleteComplaint',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/complaints/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete complaint');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.items = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const item = state.items.find((c) => c.id === action.payload.id);
        if (item) {
          item.status = action.payload.status;
        }
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setComplaints, setSelectedCategory } = complaintsSlice.actions;

// ── SELECTORS ──

export const selectAllComplaints = (state: RootState) => state.complaints?.items || [];
export const selectComplaintsLoading = (state: RootState) => state.complaints?.status === 'loading';
export const selectComplaintCategoryFilter = (state: RootState) => state.complaints?.selectedCategory || 'ALL';

export const selectResolvedComplaints = createSelector(
  [selectAllComplaints],
  (items) => items.filter((c) => c.status === 'RESOLVED')
);

export const selectFilteredComplaints = createSelector(
  [selectAllComplaints, selectComplaintCategoryFilter],
  (items, category) => (category === 'ALL' ? items : items.filter((c) => c.category === category))
);

export default complaintsSlice.reducer;

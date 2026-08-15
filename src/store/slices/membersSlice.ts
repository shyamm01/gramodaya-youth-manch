import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { Member } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface MembersState {
  items: Member[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedMember: Member | null;
}

const initialState: MembersState = {
  items: [],
  status: 'idle',
  error: null,
  selectedMember: null,
};

// ── ASYNC THUNKS ──

export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/members?villageId=${encodeURIComponent(villageId)}` : '/api/members';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.members)) {
        return data.members as Member[];
      }
      return (data?.members || []) as Member[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch members');
    }
  }
);

export const addMember = createAsyncThunk(
  'members/addMember',
  async (memberData: Partial<Member>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/members', memberData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to register member');
      }
      return data.member as Member;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveMember = createAsyncThunk(
  'members/approveMember',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.patch(`/api/members/${id}`, { status: 'active' });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to approve member');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/members/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete member');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.items = action.payload;
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedMember = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(approveMember.fulfilled, (state, action) => {
        const mem = state.items.find((m) => m.id === action.payload);
        if (mem) mem.status = 'active';
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const { setMembers, setSelectedMember } = membersSlice.actions;

// ── SELECTORS ──

export const selectAllMembers = (state: RootState) => state.members?.items || [];
export const selectMembersStatus = (state: RootState) => state.members?.status || 'idle';
export const selectMembersLoading = (state: RootState) => state.members?.status === 'loading';

export const selectActiveMembers = createSelector(
  [selectAllMembers],
  (items) => items.filter((m) => m.status === 'active')
);

export const selectPendingMembers = createSelector(
  [selectAllMembers],
  (items) => items.filter((m) => m.status === 'pending')
);

export const selectMembersWithPhoto = createSelector(
  [selectActiveMembers],
  (active) => active.filter((m) => Boolean(m.photoUrl))
);

export default membersSlice.reducer;

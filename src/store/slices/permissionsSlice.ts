import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/src/lib/apiClient';
import type { ModuleDefinition, SystemPermissionDef } from '@/src/lib/permissions';
import type { RootState } from '../index';

export interface PermissionsState {
  modules: ModuleDefinition[];
  permissions: SystemPermissionDef[];
  userPermissions: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PermissionsState = {
  modules: [],
  permissions: [],
  userPermissions: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchPermissionsCatalog = createAsyncThunk(
  'permissions/fetchCatalog',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/permissions');
      if (data && data.success) {
        return {
          modules: data.modules || [],
          permissions: data.permissions || [],
        };
      }
      return rejectWithValue(data?.error || 'Failed to load permissions catalog');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch permissions');
    }
  }
);

export const fetchMemberPermissions = createAsyncThunk(
  'permissions/fetchMemberPermissions',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.get(`/api/permissions/${memberId}`);
      if (data && data.success) {
        return data.effectivePermissions || [];
      }
      return rejectWithValue(data?.error || 'Failed to load member permissions');
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMemberPermissions = createAsyncThunk(
  'permissions/updateMemberPermissions',
  async (
    { memberId, permissions, adminName, adminMobile }: { memberId: string; permissions: string[]; adminName?: string; adminMobile?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiClient.post(`/api/permissions/${memberId}`, { permissions, adminName, adminMobile });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update member permissions');
      }
      return { memberId, permissions };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserPermissions: (state, action: PayloadAction<string[]>) => {
      state.userPermissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionsCatalog.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPermissionsCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.modules = action.payload.modules;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchPermissionsCatalog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchMemberPermissions.fulfilled, (state, action) => {
        state.userPermissions = action.payload;
      });
  },
});

export const { setUserPermissions } = permissionsSlice.actions;

// ── SELECTORS ──

export const selectSystemModules = (state: RootState) => state.permissions?.modules || [];
export const selectAllPermissionsCatalog = (state: RootState) => state.permissions?.permissions || [];
export const selectCurrentUserPermissions = (state: RootState) => state.permissions?.userPermissions || [];

export default permissionsSlice.reducer;

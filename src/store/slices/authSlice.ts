import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Member, SystemRole, PermissionCode } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';

export interface AuthState {
  user: Member | null;
  token: string | null;
  role: SystemRole | null;
  systemRole: SystemRole | null;
  permissions: PermissionCode[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ── 1. ASYNC THUNKS (createAsyncThunk with Axios) ──

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/auth/login', credentials);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'लॉगिन करने में त्रुटि हुई।');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (memberData: Record<string, any>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/members', memberData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'पंजीकरण करने में त्रुटि हुई।');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'नेटवर्क त्रुटि हुई।');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/auth/me');
      if (!data?.authenticated) {
        return rejectWithValue('Unauthenticated');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/auth/logout');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── 2. INITIAL STATE ──

const loadInitialAuth = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('gym_auth');
    const token = localStorage.getItem('gym_token');
    if (raw) {
      const parsed = JSON.parse(raw);
      const isAdm = Boolean(parsed.isAdminLoggedIn);
      const role = (parsed.role || (isAdm ? 'ADMIN' : 'MEMBER')) as SystemRole;
      return {
        user: parsed.currentMember || (isAdm ? {
          id: parsed.adminId || 'admin',
          name: parsed.adminName || 'Admin',
          mobile: parsed.adminMobile || '',
          email: parsed.email || '',
          role: 'ADMIN',
          systemRole: role,
          status: 'active',
          villageId: 'vil_rasoolpur',
        } as Member : null),
        token: token || parsed.token || null,
        role: role,
        systemRole: role,
        permissions: parsed.permissions || [],
        isAuthenticated: Boolean(parsed.isAdminLoggedIn || parsed.isMemberLoggedIn),
        isAdmin: isAdm,
        isSuperAdmin: role === 'SUPER_ADMIN',
      };
    }
  } catch (e) {
    console.warn('Failed to parse initial auth state:', e);
  }
  return {};
};

const initialSaved = loadInitialAuth();

const initialState: AuthState = {
  user: initialSaved.user || null,
  token: initialSaved.token || null,
  role: initialSaved.role || null,
  systemRole: initialSaved.systemRole || null,
  permissions: initialSaved.permissions || [],
  isAuthenticated: initialSaved.isAuthenticated ?? false,
  isAdmin: initialSaved.isAdmin ?? false,
  isSuperAdmin: initialSaved.isSuperAdmin ?? false,
  status: 'idle',
  error: null,
};

// ── 3. SLICE DEFINITION ──

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: Member;
        token: string;
        role?: SystemRole;
      }>
    ) => {
      const { user, token, role } = action.payload;
      const effectiveRole = role || user.systemRole || user.role || 'MEMBER';
      const isAdm = effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN';

      state.user = user;
      state.token = token;
      state.role = effectiveRole;
      state.systemRole = effectiveRole;
      state.isAuthenticated = true;
      state.isAdmin = isAdm;
      state.isSuperAdmin = effectiveRole === 'SUPER_ADMIN';
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('gym_token', token);
        localStorage.setItem(
          'gym_auth',
          JSON.stringify({
            isAdminLoggedIn: isAdm,
            isMemberLoggedIn: true,
            role: effectiveRole,
            systemRole: effectiveRole,
            adminId: isAdm ? user.id : undefined,
            adminName: isAdm ? user.name : undefined,
            adminMobile: isAdm ? user.mobile : undefined,
            currentMember: user,
            currentMemberMobile: user.mobile,
            token,
          })
        );
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.systemRole = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isSuperAdmin = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_auth');
        localStorage.removeItem('gym_member_mobile');
      }
    },

    updateUserProfile: (state, action: PayloadAction<Partial<Member>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. loginUser Thunk
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload;
        const effectiveRole = payload.role || payload.user?.systemRole || (payload.isAdmin ? 'ADMIN' : 'MEMBER');
        const isAdm = Boolean(payload.isAdmin || effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN');
        const user = payload.user || payload.member;

        state.user = user;
        state.token = payload.token;
        state.role = effectiveRole;
        state.systemRole = effectiveRole;
        state.isAuthenticated = true;
        state.isAdmin = isAdm;
        state.isSuperAdmin = effectiveRole === 'SUPER_ADMIN';

        if (typeof window !== 'undefined' && payload.token) {
          localStorage.setItem('gym_token', payload.token);
          localStorage.setItem(
            'gym_auth',
            JSON.stringify({
              isAdminLoggedIn: isAdm,
              isMemberLoggedIn: true,
              role: effectiveRole,
              systemRole: effectiveRole,
              adminId: isAdm ? user?.id : undefined,
              adminName: isAdm ? user?.name : undefined,
              adminMobile: isAdm ? user?.mobile : undefined,
              currentMember: user,
              currentMemberMobile: user?.mobile,
              token: payload.token,
            })
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Login failed';
      });

    // 2. registerUser Thunk
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload;
        if (payload.token && payload.member) {
          state.user = payload.member;
          state.token = payload.token;
          state.role = 'MEMBER';
          state.systemRole = 'MEMBER';
          state.isAuthenticated = true;
          state.isAdmin = false;
          state.isSuperAdmin = false;

          if (typeof window !== 'undefined') {
            localStorage.setItem('gym_token', payload.token);
            localStorage.setItem(
              'gym_auth',
              JSON.stringify({
                isAdminLoggedIn: false,
                isMemberLoggedIn: true,
                role: 'MEMBER',
                systemRole: 'MEMBER',
                currentMember: payload.member,
                currentMemberMobile: payload.member.mobile,
                token: payload.token,
              })
            );
          }
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Registration failed';
      });

    // 3. fetchCurrentUser Thunk
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload.authenticated && payload.user) {
        const isAdm = Boolean(payload.isAdmin || payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN');
        state.user = payload.user;
        state.token = payload.token || state.token;
        state.role = payload.role;
        state.systemRole = payload.role;
        state.isAuthenticated = true;
        state.isAdmin = isAdm;
        state.isSuperAdmin = payload.role === 'SUPER_ADMIN';
      }
    });

    // 4. logoutUser Thunk
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.systemRole = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isSuperAdmin = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_auth');
        localStorage.removeItem('gym_member_mobile');
      }
    });
  },
});

export const { setCredentials, logout, updateUserProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

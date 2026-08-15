import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { GroupMessage } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface ChatState {
  groupMessages: GroupMessage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChatState = {
  groupMessages: [],
  status: 'idle',
  error: null,
};

// ── ASYNC THUNKS ──

export const fetchGroupChat = createAsyncThunk(
  'chat/fetchGroupChat',
  async (villageId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = villageId ? `/api/group-chat?villageId=${encodeURIComponent(villageId)}` : '/api/group-chat';
      const data = await apiClient.get(url);
      if (data && data.success && Array.isArray(data.groupMessages)) {
        return data.groupMessages as GroupMessage[];
      }
      return (data?.groupMessages || []) as GroupMessage[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch group chat');
    }
  }
);

export const sendGroupMessage = createAsyncThunk(
  'chat/sendGroupMessage',
  async (
    msgData: { senderName: string; text: string; senderMobile?: string; senderPhoto?: string; villageId?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiClient.post('/api/group-chat', msgData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to send message');
      }
      return data.message as GroupMessage;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteGroupMessage = createAsyncThunk(
  'chat/deleteGroupMessage',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(`/api/group-chat/${id}`);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to delete message');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── SLICE DEFINITION ──

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setGroupMessages: (state, action: PayloadAction<GroupMessage[]>) => {
      state.groupMessages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupChat.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGroupChat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groupMessages = action.payload;
      })
      .addCase(fetchGroupChat.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.groupMessages.push(action.payload);
      })
      .addCase(deleteGroupMessage.fulfilled, (state, action) => {
        state.groupMessages = state.groupMessages.filter((m) => m.id !== action.payload);
      });
  },
});

export const { setGroupMessages } = chatSlice.actions;

// ── SELECTORS ──

export const selectGroupMessages = (state: RootState) => state.chat?.groupMessages || [];
export const selectChatLoading = (state: RootState) => state.chat?.status === 'loading';

export default chatSlice.reducer;

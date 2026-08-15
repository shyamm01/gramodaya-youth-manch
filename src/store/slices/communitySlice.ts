import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type {
  Member,
  Complaint,
  SocialWork,
  EventItem,
  GalleryItem,
  Elder,
  Announcement,
  PublicInfo,
  GroupMessage,
  AuditLog,
  VillageSettings,
  Village,
} from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import type { RootState } from '../index';

export interface CommunityState {
  members: Member[];
  complaints: Complaint[];
  socialWorks: SocialWork[];
  events: EventItem[];
  gallery: GalleryItem[];
  elders: Elder[];
  announcements: Announcement[];
  publicInfos: PublicInfo[];
  groupMessages: GroupMessage[];
  auditLogs: AuditLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ── 1. ASYNC THUNKS (createAsyncThunk with Axios) ──

export const fetchAppData = createAsyncThunk(
  'community/fetchAppData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/villages');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load villages data');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'community/createComplaint',
  async (complaintData: Partial<Complaint>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/complaints', complaintData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to submit complaint');
      }
      return data.complaint;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'community/updateComplaintStatus',
  async (
    { id, status, resolutionNotes }: { id: string; status: string; resolutionNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiClient.patch(`/api/complaints/${id}`, { status, resolutionNotes });
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to update complaint');
      }
      return data.complaint;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createSocialWork = createAsyncThunk(
  'community/createSocialWork',
  async (workData: Partial<SocialWork>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/social-work', workData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to create social work');
      }
      return data.socialWork;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'community/createEvent',
  async (eventData: Partial<EventItem>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/events', eventData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to create event');
      }
      return data.event;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const uploadGalleryPhoto = createAsyncThunk(
  'community/uploadGalleryPhoto',
  async (photoData: Partial<GalleryItem>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/gallery', photoData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to upload photo');
      }
      return data.item;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addElderHonor = createAsyncThunk(
  'community/addElderHonor',
  async (elderData: Partial<Elder>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/elders', elderData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to add elder');
      }
      return data.elder;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'community/createAnnouncement',
  async (announcementData: Partial<Announcement>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/announcements', announcementData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to publish announcement');
      }
      return data.announcement;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPublicInfo = createAsyncThunk(
  'community/createPublicInfo',
  async (infoData: Partial<PublicInfo>, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/public-info', infoData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to add public info');
      }
      return data.publicInfo;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchGroupChat = createAsyncThunk(
  'community/fetchGroupChat',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/api/group-chat');
      return data.groupMessages || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const sendGroupMessage = createAsyncThunk(
  'community/sendGroupMessage',
  async (
    messageData: { senderName: string; text: string; senderMobile?: string; senderPhoto?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiClient.post('/api/group-chat', messageData);
      if (!data?.success) {
        return rejectWithValue(data?.error || 'Failed to send message');
      }
      return data.message;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── 2. INITIAL STATE ──

const initialState: CommunityState = {
  members: [],
  complaints: [],
  socialWorks: [],
  events: [],
  gallery: [],
  elders: [],
  announcements: [],
  publicInfos: [],
  groupMessages: [],
  auditLogs: [],
  status: 'idle',
  error: null,
};

// ── 3. SLICE DEFINITION ──

export const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
    },
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.complaints = action.payload;
    },
    setSocialWorks: (state, action: PayloadAction<SocialWork[]>) => {
      state.socialWorks = action.payload;
    },
    setEvents: (state, action: PayloadAction<EventItem[]>) => {
      state.events = action.payload;
    },
    setGallery: (state, action: PayloadAction<GalleryItem[]>) => {
      state.gallery = action.payload;
    },
    setElders: (state, action: PayloadAction<Elder[]>) => {
      state.elders = action.payload;
    },
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload;
    },
    setPublicInfos: (state, action: PayloadAction<PublicInfo[]>) => {
      state.publicInfos = action.payload;
    },
    setGroupMessages: (state, action: PayloadAction<GroupMessage[]>) => {
      state.groupMessages = action.payload;
    },
    addLocalGroupMessage: (state, action: PayloadAction<GroupMessage>) => {
      state.groupMessages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    // 1. fetchAppData
    builder
      .addCase(fetchAppData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        if (data.members) state.members = data.members;
        if (data.complaints) state.complaints = data.complaints;
        if (data.socialWorks) state.socialWorks = data.socialWorks;
        if (data.events) state.events = data.events;
        if (data.gallery) state.gallery = data.gallery;
        if (data.elders) state.elders = data.elders;
        if (data.announcements) state.announcements = data.announcements;
        if (data.publicInfos) state.publicInfos = data.publicInfos;
        if (data.auditLogs) state.auditLogs = data.auditLogs;
      })
      .addCase(fetchAppData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Fetch failed';
      });

    // 2. createComplaint
    builder.addCase(createComplaint.fulfilled, (state, action) => {
      if (action.payload) {
        state.complaints.unshift(action.payload);
      }
    });

    // 3. updateComplaintStatus
    builder.addCase(updateComplaintStatus.fulfilled, (state, action) => {
      if (action.payload) {
        const idx = state.complaints.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.complaints[idx] = action.payload;
        }
      }
    });

    // 4. createSocialWork
    builder.addCase(createSocialWork.fulfilled, (state, action) => {
      if (action.payload) {
        state.socialWorks.unshift(action.payload);
      }
    });

    // 5. createEvent
    builder.addCase(createEvent.fulfilled, (state, action) => {
      if (action.payload) {
        state.events.unshift(action.payload);
      }
    });

    // 6. uploadGalleryPhoto
    builder.addCase(uploadGalleryPhoto.fulfilled, (state, action) => {
      if (action.payload) {
        state.gallery.unshift(action.payload);
      }
    });

    // 7. addElderHonor
    builder.addCase(addElderHonor.fulfilled, (state, action) => {
      if (action.payload) {
        state.elders.unshift(action.payload);
      }
    });

    // 8. createAnnouncement
    builder.addCase(createAnnouncement.fulfilled, (state, action) => {
      if (action.payload) {
        state.announcements.unshift(action.payload);
      }
    });

    // 9. createPublicInfo
    builder.addCase(createPublicInfo.fulfilled, (state, action) => {
      if (action.payload) {
        state.publicInfos.unshift(action.payload);
      }
    });

    // 10. fetchGroupChat
    builder.addCase(fetchGroupChat.fulfilled, (state, action) => {
      state.groupMessages = action.payload;
    });

    // 11. sendGroupMessage
    builder.addCase(sendGroupMessage.fulfilled, (state, action) => {
      if (action.payload) {
        state.groupMessages.push(action.payload);
      }
    });
  },
});

export const {
  setMembers,
  setComplaints,
  setSocialWorks,
  setEvents,
  setGallery,
  setElders,
  setAnnouncements,
  setPublicInfos,
  setGroupMessages,
  addLocalGroupMessage,
} = communitySlice.actions;

// Memoized Selectors
export const selectCommunity = (state: RootState) => state.community;
export const selectMembers = (state: RootState) => state.community.members;
export const selectActiveMembers = createSelector([selectMembers], (members) =>
  members.filter((m) => m.status === 'active')
);
export const selectPendingMembers = createSelector([selectMembers], (members) =>
  members.filter((m) => m.status === 'pending')
);
export const selectComplaints = (state: RootState) => state.community.complaints;
export const selectEvents = (state: RootState) => state.community.events;
export const selectSocialWorks = (state: RootState) => state.community.socialWorks;
export const selectGallery = (state: RootState) => state.community.gallery;
export const selectElders = (state: RootState) => state.community.elders;
export const selectAnnouncements = (state: RootState) => state.community.announcements;
export const selectPublicInfos = (state: RootState) => state.community.publicInfos;
export const selectGroupMessages = (state: RootState) => state.community.groupMessages;

export default communitySlice.reducer;

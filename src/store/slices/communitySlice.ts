import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
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
import { gymApi } from '../services/gymApi';
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
  isLoading: boolean;
  error: string | null;
}

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
  isLoading: false,
  error: null,
};

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
    builder.addMatcher(gymApi.endpoints.getAppData.matchPending, (state) => {
      state.isLoading = true;
    });
    builder.addMatcher(gymApi.endpoints.getAppData.matchFulfilled, (state, action) => {
      state.isLoading = false;
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
    });
    builder.addMatcher(gymApi.endpoints.getAppData.matchRejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load community data';
    });

    builder.addMatcher(gymApi.endpoints.getGroupMessages.matchFulfilled, (state, action) => {
      if (action.payload.groupMessages) {
        state.groupMessages = action.payload.groupMessages;
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

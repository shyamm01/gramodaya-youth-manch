import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Member,
  Village,
  VillageSettings,
  Complaint,
  SocialWork,
  EventItem,
  GalleryItem,
  Elder,
  Announcement,
  PublicInfo,
  GroupMessage,
  UserPermission,
  SystemRole,
} from '@/src/types';

export interface AppDataResponse {
  villageSettings: VillageSettings;
  villages: Village[];
  userPermissions: UserPermission[];
  admins: any[];
  members: Member[];
  complaints: Complaint[];
  socialWorks: SocialWork[];
  publicInfos: PublicInfo[];
  announcements: Announcement[];
  events: EventItem[];
  gallery: GalleryItem[];
  elders: Elder[];
  auditLogs: any[];
  apiIntegrations: any[];
  permissions: any[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    totalSocialWorks: number;
    totalEvents: number;
    totalGallery: number;
    totalElders: number;
    totalVillages: number;
  };
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  isAdmin: boolean;
  role: SystemRole;
  token: string;
  user: Member;
  member: Member;
  message?: string;
  error?: string;
}

export interface RegisterMemberRequest {
  name: string;
  mobile: string;
  password?: string;
  email?: string;
  gender?: string;
  fatherName?: string;
  dob?: string;
  address?: string;
  villageId?: string;
  occupation?: string;
  designation?: string;
  politicalBackground?: string;
  bloodGroup?: string;
  photoUrl?: string;
}

export const gymApi = createApi({
  reducerPath: 'gymApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('gym_token');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    'AppData',
    'Members',
    'Villages',
    'Complaints',
    'SocialWorks',
    'Events',
    'Gallery',
    'Elders',
    'Announcements',
    'PublicInfos',
    'GroupChat',
  ],
  endpoints: (builder) => ({
    // 1. App Data
    getAppData: builder.query<AppDataResponse, void>({
      query: () => '/data',
      providesTags: ['AppData'],
    }),

    // 2. Auth: Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['AppData', 'Members'],
    }),

    // 3. Auth: Logout
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['AppData'],
    }),

    // 4. Members: Register
    registerMember: builder.mutation<{ success: boolean; member: Member; token: string; message: string }, RegisterMemberRequest>({
      query: (body) => ({
        url: '/members',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Members'],
    }),

    // 5. Complaints
    createComplaint: builder.mutation<{ success: boolean; complaint: Complaint }, any>({
      query: (body) => ({
        url: '/complaints',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Complaints'],
    }),

    // 6. Social Work
    createSocialWork: builder.mutation<{ success: boolean; socialWork: SocialWork }, any>({
      query: (body) => ({
        url: '/social-work',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'SocialWorks'],
    }),

    // 7. Events
    createEvent: builder.mutation<{ success: boolean; event: EventItem }, any>({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Events'],
    }),

    // 8. Gallery
    uploadGalleryPhoto: builder.mutation<{ success: boolean; photo: GalleryItem }, any>({
      query: (body) => ({
        url: '/gallery',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Gallery'],
    }),

    // 9. Elders
    addElder: builder.mutation<{ success: boolean; elder: Elder }, any>({
      query: (body) => ({
        url: '/elders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Elders'],
    }),

    // 10. Announcements
    createAnnouncement: builder.mutation<{ success: boolean; announcement: Announcement }, any>({
      query: (body) => ({
        url: '/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'Announcements'],
    }),

    // 11. Public Info
    createPublicInfo: builder.mutation<{ success: boolean; publicInfo: PublicInfo }, any>({
      query: (body) => ({
        url: '/public-info',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppData', 'PublicInfos'],
    }),

    // 12. Group Chat
    getGroupMessages: builder.query<{ success: boolean; groupMessages: GroupMessage[] }, void>({
      query: () => '/group-chat',
      providesTags: ['GroupChat'],
    }),

    postGroupMessage: builder.mutation<{ success: boolean; groupMessage: GroupMessage }, any>({
      query: (body) => ({
        url: '/group-chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupChat'],
    }),
  }),
});

export const {
  useGetAppDataQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMemberMutation,
  useCreateComplaintMutation,
  useCreateSocialWorkMutation,
  useCreateEventMutation,
  useUploadGalleryPhotoMutation,
  useAddElderMutation,
  useCreateAnnouncementMutation,
  useCreatePublicInfoMutation,
  useGetGroupMessagesQuery,
  usePostGroupMessageMutation,
} = gymApi;

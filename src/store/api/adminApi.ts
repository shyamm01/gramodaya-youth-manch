import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';
import type {
  Member,
  Complaint,
  ComplaintStatus,
  SocialWork,
  PublicInfo,
  Announcement,
  EventItem,
  EventStatus,
  GalleryItem,
  Elder,
  Village,
  AppStats,
} from '@/src/types';

/**
 * The admin panel's data layer.
 *
 * Before this existed, every create, edit and delete in the panel finished by
 * calling AppContext's refreshData(true), which refetched members, complaints,
 * social works, events, gallery, elders, announcements, public infos, the
 * village list and the session — ten round trips — no matter which one row had
 * actually changed. Approving a single member cost the same as a cold boot.
 *
 * RTK Query replaces that with tags. A mutation declares what it invalidated;
 * only the queries carrying that tag refetch. Approving a member now refetches
 * members (and the dashboard counters that depend on them), and nothing else.
 *
 * Collections are cached, so moving between admin sections re-renders from
 * cache instead of refetching, and a section mounted twice shares one request.
 */

export const ADMIN_TAGS = [
  'Member',
  'Complaint',
  'SocialWork',
  'PublicInfo',
  'Announcement',
  'Event',
  'Gallery',
  'Elder',
  'Village',
  'Stats',
] as const;

export type AdminTag = (typeof ADMIN_TAGS)[number];

/** Tags a list response so a single-row invalidation can target one item. */
const listTags = <T extends { id: string }>(tag: AdminTag, rows: T[] | undefined) =>
  rows
    ? [...rows.map(({ id }) => ({ type: tag, id })), { type: tag, id: 'LIST' as const }]
    : [{ type: tag, id: 'LIST' as const }];

/** Unwraps `{ success, <key>: [...] }`, the shape every collection route returns. */
const unwrapList =
  <T>(key: string) =>
  (response: any): T[] =>
    Array.isArray(response?.[key]) ? (response[key] as T[]) : [];

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ADMIN_TAGS,
  // The panel is a long-lived screen an admin keeps open. Sixty seconds is long
  // enough that tab-switching is free, short enough that a row another admin
  // changed does not sit stale on screen for the rest of the session.
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 60,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    // ── MEMBERS ──
    getMembers: build.query<Member[], string | void>({
      query: (villageId) => ({
        url: '/api/members',
        params: villageId ? { villageId } : undefined,
      }),
      transformResponse: unwrapList<Member>('members'),
      providesTags: (rows) => listTags('Member', rows),
    }),
    addMember: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/members', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Stats'],
    }),
    updateMember: build.mutation<any, { id: string; updates: Partial<Member> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/members/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Member', id }, { type: 'Member', id: 'LIST' }, 'Stats'],
    }),
    deleteMember: build.mutation<any, string>({
      query: (id) => ({ url: `/api/members/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Member', id }, { type: 'Member', id: 'LIST' }, 'Stats'],
    }),

    // ── COMPLAINTS (grievances) ──
    getComplaints: build.query<Complaint[], void>({
      query: () => ({ url: '/api/complaints' }),
      transformResponse: unwrapList<Complaint>('complaints'),
      providesTags: (rows) => listTags('Complaint', rows),
    }),
    addComplaint: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/complaints', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Complaint', id: 'LIST' }, 'Stats'],
    }),
    updateComplaint: build.mutation<any, { id: string; updates: Partial<Complaint> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/complaints/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Complaint', id }, { type: 'Complaint', id: 'LIST' }, 'Stats'],
    }),
    updateComplaintStatus: build.mutation<any, { id: string; status: ComplaintStatus } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/complaints/${id}/status`, method: 'PATCH', data }),
      // The status pill flips before the request lands, and rolls back on
      // failure. The old code tried this by assigning into the complaints array
      // in place, which React never saw — the pill only moved once the refetch
      // that followed happened to return.
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          adminApi.util.updateQueryData('getComplaints', undefined, (draft) => {
            const row = draft.find((c) => c.id === id);
            if (row) {
              row.status = status;
              if (status === 'RESOLVED') row.resolvedAt = new Date().toISOString();
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Complaint', id }, 'Stats'],
    }),
    deleteComplaint: build.mutation<any, { id: string } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/complaints/${id}`, method: 'DELETE', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Complaint', id }, { type: 'Complaint', id: 'LIST' }, 'Stats'],
    }),

    // ── SOCIAL WORK ──
    getSocialWorks: build.query<SocialWork[], void>({
      query: () => ({ url: '/api/social-work' }),
      transformResponse: unwrapList<SocialWork>('socialWorks'),
      providesTags: (rows) => listTags('SocialWork', rows),
    }),
    addSocialWork: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/social-work', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'SocialWork', id: 'LIST' }, 'Stats'],
    }),
    updateSocialWork: build.mutation<any, { id: string; updates: Partial<SocialWork> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/social-work/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SocialWork', id }, { type: 'SocialWork', id: 'LIST' }, 'Stats'],
    }),
    updateSocialWorkStatus: build.mutation<any, { id: string; status: string } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/social-work/${id}/status`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SocialWork', id }, { type: 'SocialWork', id: 'LIST' }, 'Stats'],
    }),
    deleteSocialWork: build.mutation<any, { id: string } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/social-work/${id}`, method: 'DELETE', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SocialWork', id }, { type: 'SocialWork', id: 'LIST' }, 'Stats'],
    }),

    // ── PUBLIC INFO ──
    getPublicInfos: build.query<PublicInfo[], void>({
      query: () => ({ url: '/api/public-info' }),
      transformResponse: unwrapList<PublicInfo>('publicInfos'),
      providesTags: (rows) => listTags('PublicInfo', rows),
    }),
    updatePublicInfoStatus: build.mutation<any, { id: string; status: string } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/public-info/${id}/status`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'PublicInfo', id }, { type: 'PublicInfo', id: 'LIST' }, 'Stats'],
    }),
    deletePublicInfo: build.mutation<any, { id: string } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/public-info/${id}`, method: 'DELETE', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'PublicInfo', id }, { type: 'PublicInfo', id: 'LIST' }, 'Stats'],
    }),

    // ── ANNOUNCEMENTS ──
    getAnnouncements: build.query<Announcement[], void>({
      query: () => ({ url: '/api/announcements' }),
      transformResponse: unwrapList<Announcement>('announcements'),
      providesTags: (rows) => listTags('Announcement', rows),
    }),
    addAnnouncement: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/announcements', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }, 'Stats'],
    }),
    updateAnnouncement: build.mutation<any, { id: string; updates: Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/announcements/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Announcement', id }, { type: 'Announcement', id: 'LIST' }],
    }),
    deleteAnnouncement: build.mutation<any, string>({
      query: (id) => ({ url: `/api/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Announcement', id }, { type: 'Announcement', id: 'LIST' }, 'Stats'],
    }),

    // ── EVENTS ──
    getEvents: build.query<EventItem[], void>({
      query: () => ({ url: '/api/events' }),
      transformResponse: unwrapList<EventItem>('events'),
      providesTags: (rows) => listTags('Event', rows),
    }),
    addEvent: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/events', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'Stats'],
    }),
    updateEvent: build.mutation<any, { id: string; updates: Partial<EventItem> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/events/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Event', id }, { type: 'Event', id: 'LIST' }, 'Stats'],
    }),
    updateEventStatus: build.mutation<any, { id: string; status: EventStatus } & Record<string, any>>({
      query: ({ id, ...data }) => ({ url: `/api/events/${id}`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Event', id }, { type: 'Event', id: 'LIST' }, 'Stats'],
    }),
    deleteEvent: build.mutation<any, string>({
      query: (id) => ({ url: `/api/events/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Event', id }, { type: 'Event', id: 'LIST' }, 'Stats'],
    }),

    // ── GALLERY ──
    getGallery: build.query<GalleryItem[], void>({
      query: () => ({ url: '/api/gallery' }),
      transformResponse: unwrapList<GalleryItem>('gallery'),
      providesTags: (rows) => listTags('Gallery', rows),
    }),
    addGalleryItem: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/gallery', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }, 'Stats'],
    }),
    updateGalleryItem: build.mutation<any, { id: string; updates: Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/gallery/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Gallery', id }, { type: 'Gallery', id: 'LIST' }, 'Stats'],
    }),
    deleteGalleryItem: build.mutation<any, string>({
      query: (id) => ({ url: `/api/gallery/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Gallery', id }, { type: 'Gallery', id: 'LIST' }, 'Stats'],
    }),

    // ── ELDERS ──
    getElders: build.query<Elder[], void>({
      query: () => ({ url: '/api/elders' }),
      transformResponse: unwrapList<Elder>('elders'),
      providesTags: (rows) => listTags('Elder', rows),
    }),
    addElder: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/elders', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Elder', id: 'LIST' }, 'Stats'],
    }),
    updateElder: build.mutation<any, { id: string; updates: Partial<Elder> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/elders/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Elder', id }, { type: 'Elder', id: 'LIST' }],
    }),
    deleteElder: build.mutation<any, string>({
      query: (id) => ({ url: `/api/elders/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Elder', id }, { type: 'Elder', id: 'LIST' }, 'Stats'],
    }),

    // ── VILLAGES ──
    getVillages: build.query<Village[], void>({
      query: () => ({ url: '/api/villages' }),
      transformResponse: unwrapList<Village>('villages'),
      providesTags: (rows) => listTags('Village', rows),
    }),
    addVillage: build.mutation<any, Record<string, any>>({
      query: (body) => ({ url: '/api/villages', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Village', id: 'LIST' }, 'Stats'],
    }),
    updateVillage: build.mutation<any, { id: string; updates: Partial<Village> & Record<string, any> }>({
      query: ({ id, updates }) => ({ url: `/api/villages/${id}`, method: 'PUT', data: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Village', id }, { type: 'Village', id: 'LIST' }],
    }),
    deleteVillage: build.mutation<any, string>({
      query: (id) => ({ url: `/api/villages/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Village', id }, { type: 'Village', id: 'LIST' }, 'Stats'],
    }),

    // ── MAINTENANCE ──
    // The one operation that legitimately invalidates everything: it replaces
    // the whole dataset, so every cached collection is stale by definition.
    resetDataStore: build.mutation<any, void>({
      query: () => ({ url: '/api/data/reset', method: 'POST' }),
      invalidatesTags: [...ADMIN_TAGS],
    }),

    // ── DASHBOARD COUNTERS ──
    getStats: build.query<AppStats | null, void>({
      query: () => ({ url: '/api/stats' }),
      transformResponse: (response: any) => (response?.stats ?? response) as AppStats,
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useGetComplaintsQuery,
  useAddComplaintMutation,
  useUpdateComplaintMutation,
  useUpdateComplaintStatusMutation,
  useDeleteComplaintMutation,
  useGetSocialWorksQuery,
  useAddSocialWorkMutation,
  useUpdateSocialWorkMutation,
  useUpdateSocialWorkStatusMutation,
  useDeleteSocialWorkMutation,
  useGetPublicInfosQuery,
  useUpdatePublicInfoStatusMutation,
  useDeletePublicInfoMutation,
  useGetAnnouncementsQuery,
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  useDeleteEventMutation,
  useGetGalleryQuery,
  useAddGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  useGetEldersQuery,
  useAddElderMutation,
  useUpdateElderMutation,
  useDeleteElderMutation,
  useGetVillagesQuery,
  useAddVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useGetStatsQuery,
  useResetDataStoreMutation,
} = adminApi;

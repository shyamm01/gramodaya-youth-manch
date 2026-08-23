import { createSelector } from '@reduxjs/toolkit';
import { adminApi } from '../api/adminApi';
import type { RootState } from '../index';
import type { AdminSectionKey, SectionFilterState } from '../slices/adminUiSlice';
import type {
  Member,
  Complaint,
  SocialWork,
  PublicInfo,
  Announcement,
  EventItem,
  GalleryItem,
  Elder,
} from '@/src/types';

/**
 * The filtered lists each admin section renders.
 *
 * AdminPanel rebuilt all seven of these on every render — plain `.filter()`
 * calls in the component body, outside any useMemo. Typing one character into
 * the member search re-filtered the complaints, social works, public infos,
 * events, gallery and elders too, even though six of those seven lists were on
 * a screen the operator could not see.
 *
 * createSelector memoizes on the cached rows and that section's filters, so a
 * keystroke in one section recomputes exactly one list, and a section whose
 * inputs did not change returns the identical array reference — which lets the
 * list below it skip re-rendering entirely.
 */

const EMPTY: never[] = [];

// ── RAW CACHE READS ──
// RTK Query exposes each endpoint's cache entry as a selector. Reading through
// these rather than a hook keeps the derivation testable and usable from thunks.

const selectMembersResult = adminApi.endpoints.getMembers.select(undefined);
const selectComplaintsResult = adminApi.endpoints.getComplaints.select();
const selectSocialWorksResult = adminApi.endpoints.getSocialWorks.select();
const selectPublicInfosResult = adminApi.endpoints.getPublicInfos.select();
const selectAnnouncementsResult = adminApi.endpoints.getAnnouncements.select();
const selectEventsResult = adminApi.endpoints.getEvents.select();
const selectGalleryResult = adminApi.endpoints.getGallery.select();
const selectEldersResult = adminApi.endpoints.getElders.select();

export const selectMembers = createSelector(
  [selectMembersResult],
  (r) => (r.data ?? EMPTY) as Member[]
);
export const selectComplaints = createSelector(
  [selectComplaintsResult],
  (r) => (r.data ?? EMPTY) as Complaint[]
);
export const selectSocialWorks = createSelector(
  [selectSocialWorksResult],
  (r) => (r.data ?? EMPTY) as SocialWork[]
);
export const selectPublicInfos = createSelector(
  [selectPublicInfosResult],
  (r) => (r.data ?? EMPTY) as PublicInfo[]
);
export const selectAnnouncements = createSelector(
  [selectAnnouncementsResult],
  (r) => (r.data ?? EMPTY) as Announcement[]
);
export const selectEvents = createSelector(
  [selectEventsResult],
  (r) => (r.data ?? EMPTY) as EventItem[]
);
export const selectGallery = createSelector(
  [selectGalleryResult],
  (r) => (r.data ?? EMPTY) as GalleryItem[]
);
export const selectElders = createSelector(
  [selectEldersResult],
  (r) => (r.data ?? EMPTY) as Elder[]
);

// ── VILLAGE SCOPING ──

/**
 * Which village the lists are scoped to.
 *
 * A super admin may look at 'ALL' villages or narrow to one; a village admin is
 * pinned to the village they administer and cannot widen it from the UI.
 */
export const selectEffectiveVillageId = createSelector(
  [
    (state: RootState) => state.auth,
    (state: RootState) => state.village?.activeVillageId,
    (state: RootState) => state.adminUi.filters.members.village,
  ],
  (auth, activeVillageId, memberVillageFilter) => {
    const isSuper = Boolean(auth?.isSuperAdmin || auth?.systemRole === 'SUPER_ADMIN' || auth?.role === 'SUPER_ADMIN');
    if (isSuper) return memberVillageFilter || activeVillageId || 'ALL';
    return auth?.user?.villageId || 'vil_rasoolpur';
  }
);

const selectFilters = (section: AdminSectionKey) => (state: RootState) =>
  state.adminUi.filters[section];

// ── MATCHERS ──
// Each mirrors the predicate the section used inline, kept here so the seven
// lists cannot drift into seven slightly different ideas of "matches".

const norm = (v: string | undefined | null) => (v || '').toLowerCase();

const matchesTerm = (term: string, ...fields: (string | undefined | null)[]) => {
  if (!term) return true;
  const q = term.toLowerCase();
  return fields.some((f) => norm(f).includes(q));
};

/** Mobile numbers are matched raw — lowercasing a digit string is pointless. */
const matchesDigits = (term: string, value: string | undefined | null) =>
  !term || (value || '').includes(term);

const matchesVillage = (scope: string, villageId: string | undefined | null) =>
  scope === 'ALL' || villageId === scope;

const matchesDate = (filter: string, value: string | undefined | null) =>
  !filter || Boolean(value && value.startsWith(filter));

const matchesStatus = (filter: string, value: string | undefined | null) =>
  filter === 'ALL' || value === filter;

// ── FILTERED LISTS ──

export const selectFilteredMembers = createSelector(
  [selectMembers, selectFilters('members'), selectEffectiveVillageId],
  (rows, f: SectionFilterState, scope) =>
    rows.filter(
      (m) =>
        (matchesTerm(f.search, m.name) || matchesDigits(f.search, m.mobile)) &&
        matchesStatus(f.status, m.status) &&
        matchesStatus(f.role, m.role || 'MEMBER') &&
        matchesVillage(scope, m.villageId) &&
        matchesDate(f.date, m.createdAt)
    )
);

export const selectFilteredComplaints = createSelector(
  [selectComplaints, selectFilters('problems'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (c) =>
        matchesStatus(f.status, c.status) &&
        matchesTerm(f.search, c.title, c.description, c.reporterName) &&
        matchesVillage(scope, c.villageId) &&
        matchesDate(f.date, c.createdAt)
    )
);

export const selectFilteredSocialWorks = createSelector(
  [selectSocialWorks, selectFilters('socialWork'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (s) =>
        matchesStatus(f.status, s.status) &&
        matchesTerm(f.search, s.title, s.description, s.submitterName) &&
        matchesVillage(scope, s.villageId) &&
        matchesDate(f.date, s.date)
    )
);

export const selectFilteredPublicInfos = createSelector(
  [selectPublicInfos, selectFilters('publicInfo'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (p) =>
        matchesStatus(f.status, p.status) &&
        (matchesTerm(f.search, p.information, p.name) || matchesDigits(f.search, p.mobile)) &&
        matchesVillage(scope, p.villageId)
    )
);

export const selectFilteredAnnouncements = createSelector(
  [selectAnnouncements, selectFilters('announcements'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (a) =>
        matchesTerm(f.search, a.title, a.content, a.publishedBy) &&
        matchesVillage(scope, a.villageId) &&
        matchesDate(f.date, a.createdAt)
    )
);

export const selectFilteredEvents = createSelector(
  [selectEvents, selectFilters('events'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (e) =>
        matchesTerm(f.search, e.title || e.name, e.description) &&
        matchesStatus(f.status, e.status) &&
        matchesVillage(scope, e.villageId) &&
        matchesDate(f.date, e.date)
    )
);

export const selectFilteredGallery = createSelector(
  [selectGallery, selectFilters('gallery'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (g) =>
        matchesTerm(f.search, g.caption, g.uploadedBy) && matchesVillage(scope, g.villageId)
    )
);

export const selectFilteredElders = createSelector(
  [selectElders, selectFilters('elders'), selectEffectiveVillageId],
  (rows, f, scope) =>
    rows.filter(
      (e) =>
        (matchesTerm(f.search, e.name, e.location) || matchesDigits(f.search, e.mobile)) &&
        matchesVillage(scope, e.villageId)
    )
);

// ── THE ROW UNDER EDIT ──
// The editors used to hold a whole copied entity in component state, which went
// stale the moment the underlying row changed. Resolving the id against the
// cache means the editor always opens on current data.

const findById = <T extends { id: string }>(rows: T[], id: string | null) =>
  id ? rows.find((r) => r.id === id) ?? null : null;

export const selectEditingMember = createSelector(
  [selectMembers, (state: RootState) => state.adminUi.editingId.members],
  findById
);
export const selectEditingComplaint = createSelector(
  [selectComplaints, (state: RootState) => state.adminUi.editingId.problems],
  findById
);
export const selectEditingSocialWork = createSelector(
  [selectSocialWorks, (state: RootState) => state.adminUi.editingId.socialWork],
  findById
);
export const selectEditingAnnouncement = createSelector(
  [selectAnnouncements, (state: RootState) => state.adminUi.editingId.announcements],
  findById
);
export const selectEditingEvent = createSelector(
  [selectEvents, (state: RootState) => state.adminUi.editingId.events],
  findById
);
export const selectEditingGalleryItem = createSelector(
  [selectGallery, (state: RootState) => state.adminUi.editingId.gallery],
  findById
);
export const selectEditingElder = createSelector(
  [selectElders, (state: RootState) => state.adminUi.editingId.elders],
  findById
);

// ── DASHBOARD COUNTERS ──
// Derived from the same cached rows the lists render, so the headline numbers
// and the lists under them can never disagree.

export const selectAdminCounters = createSelector(
  [selectMembers, selectComplaints, selectSocialWorks, selectEvents, selectGallery],
  (members, complaints, socialWorks, events, gallery) => ({
    totalMembers: members.length,
    pendingMembers: members.filter((m) => m.status === 'pending').length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((c) => c.status !== 'RESOLVED').length,
    resolvedComplaints: complaints.filter((c) => c.status === 'RESOLVED').length,
    totalSocialWorks: socialWorks.length,
    pendingSocialWorks: socialWorks.filter((s) => s.status === 'pending').length,
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => e.status === 'PUBLISHED').length,
    totalGallery: gallery.length,
    pendingGallery: gallery.filter((g) => g.status === 'pending').length,
  })
);

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

/**
 * Everything the admin panel remembers about what the operator is looking at:
 * which section is open, how each list is filtered, which form or editor is up,
 * and the result line from the last action.
 *
 * AdminPanel held all of this in 136 useState calls in one 3,853-line
 * component. Because they were local, switching sections threw away the filters
 * an admin had just set, and any section that wanted to react to another's
 * state could not. Because they were declared per section, adding a tenth list
 * meant adding five more near-identical hooks.
 *
 * The filter and editor state is keyed by section instead, so a new section
 * costs one entry in ADMIN_SECTIONS rather than a new block of hooks, and the
 * filters survive navigating away and back.
 */

export const ADMIN_SECTIONS = [
  'members',
  'problems',
  'socialWork',
  'publicInfo',
  'announcements',
  'events',
  'gallery',
  'elders',
  'villages',
] as const;

export type AdminSectionKey = (typeof ADMIN_SECTIONS)[number];

export interface SectionFilterState {
  search: string;
  /** 'ALL' plus whatever status union the section's rows carry. */
  status: string;
  role: string;
  village: string;
  /** ISO date (yyyy-mm-dd); empty means no date filter. */
  date: string;
}

/** Matches SectionNotice in section-ui, so NoticeBanner renders it directly. */
export interface AdminNotice {
  type: 'ok' | 'error';
  text: string;
}

export interface AdminUiState {
  activeTab: string;
  filters: Record<AdminSectionKey, SectionFilterState>;
  /** id of the row each section is currently editing, or null. */
  editingId: Record<AdminSectionKey, string | null>;
  /** which section's create form is open, or null — only one can be. */
  openForm: AdminSectionKey | null;
  /** the row a destructive action is waiting on confirmation for. */
  confirming: { section: AdminSectionKey; id: string; label: string } | null;
  confirmBusy: boolean;
  notice: Record<AdminSectionKey | 'global', AdminNotice | null>;
}

const emptyFilters = (): SectionFilterState => ({
  search: '',
  status: 'ALL',
  role: 'ALL',
  village: 'ALL',
  date: '',
});

const bySection = <T>(make: () => T) =>
  ADMIN_SECTIONS.reduce((acc, key) => {
    acc[key] = make();
    return acc;
  }, {} as Record<AdminSectionKey, T>);

const initialState: AdminUiState = {
  activeTab: 'dashboard',
  filters: bySection(emptyFilters),
  editingId: bySection<string | null>(() => null),
  openForm: null,
  confirming: null,
  confirmBusy: false,
  notice: { ...bySection<AdminNotice | null>(() => null), global: null },
};

export const adminUiSlice = createSlice({
  name: 'adminUi',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<{
        section: AdminSectionKey;
        field: keyof SectionFilterState;
        value: string;
      }>
    ) => {
      const { section, field, value } = action.payload;
      state.filters[section][field] = value;
    },
    resetFilters: (state, action: PayloadAction<AdminSectionKey>) => {
      state.filters[action.payload] = emptyFilters();
    },
    setEditingId: (
      state,
      action: PayloadAction<{ section: AdminSectionKey; id: string | null }>
    ) => {
      state.editingId[action.payload.section] = action.payload.id;
    },
    openForm: (state, action: PayloadAction<AdminSectionKey>) => {
      state.openForm = action.payload;
    },
    closeForm: (state) => {
      state.openForm = null;
    },
    askConfirm: (
      state,
      action: PayloadAction<{ section: AdminSectionKey; id: string; label: string }>
    ) => {
      state.confirming = action.payload;
      state.confirmBusy = false;
    },
    setConfirmBusy: (state, action: PayloadAction<boolean>) => {
      state.confirmBusy = action.payload;
    },
    clearConfirm: (state) => {
      state.confirming = null;
      state.confirmBusy = false;
    },
    setNotice: (
      state,
      action: PayloadAction<{ section: AdminSectionKey | 'global'; notice: AdminNotice | null }>
    ) => {
      state.notice[action.payload.section] = action.payload.notice;
    },
    clearNotice: (state, action: PayloadAction<AdminSectionKey | 'global'>) => {
      state.notice[action.payload] = null;
    },
  },
});

export const {
  setActiveTab,
  setFilter,
  resetFilters,
  setEditingId,
  openForm,
  closeForm,
  askConfirm,
  setConfirmBusy,
  clearConfirm,
  setNotice,
  clearNotice,
} = adminUiSlice.actions;

// ── SELECTORS ──

export const selectActiveTab = (state: RootState) => state.adminUi.activeTab;

export const selectSectionFilters = (section: AdminSectionKey) => (state: RootState) =>
  state.adminUi.filters[section];

export const selectEditingId = (section: AdminSectionKey) => (state: RootState) =>
  state.adminUi.editingId[section];

export const selectOpenForm = (state: RootState) => state.adminUi.openForm;
export const selectConfirming = (state: RootState) => state.adminUi.confirming;
export const selectConfirmBusy = (state: RootState) => state.adminUi.confirmBusy;

export const selectNotice = (section: AdminSectionKey | 'global') => (state: RootState) =>
  state.adminUi.notice[section];

export default adminUiSlice.reducer;

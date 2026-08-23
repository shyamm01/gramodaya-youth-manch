'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  setFilter,
  resetFilters,
  setEditingId,
  openForm as openFormAction,
  closeForm as closeFormAction,
  askConfirm as askConfirmAction,
  clearConfirm as clearConfirmAction,
  setConfirmBusy,
  setNotice,
  type AdminSectionKey,
  type SectionFilterState,
  type AdminNotice,
} from '@/src/store/slices/adminUiSlice';

/**
 * One hook that gives an admin section everything it needs to drive its own
 * chrome: the filters on its list, which row it is editing, whether its create
 * form is open, the pending confirmation, and the notice line.
 *
 * Each section used to declare this by hand — a useState per filter field, per
 * editor field, per dialog flag — which is most of how AdminPanel reached 136
 * of them. The state lives in adminUi now, so a section that wants a search box
 * calls this and reads `filters.search`; there is nothing to wire up.
 */
export function useAdminSection(section: AdminSectionKey) {
  const dispatch = useAppDispatch();

  const filters = useAppSelector((s) => s.adminUi.filters[section]);
  const editingId = useAppSelector((s) => s.adminUi.editingId[section]);
  const isFormOpen = useAppSelector((s) => s.adminUi.openForm === section);
  const confirming = useAppSelector((s) =>
    s.adminUi.confirming?.section === section ? s.adminUi.confirming : null
  );
  const confirmBusy = useAppSelector((s) => s.adminUi.confirmBusy);
  const notice = useAppSelector((s) => s.adminUi.notice[section]);

  const updateFilter = useCallback(
    (field: keyof SectionFilterState, value: string) =>
      dispatch(setFilter({ section, field, value })),
    [dispatch, section]
  );

  const clearFilters = useCallback(() => dispatch(resetFilters(section)), [dispatch, section]);

  const beginEdit = useCallback(
    (id: string) => dispatch(setEditingId({ section, id })),
    [dispatch, section]
  );

  const endEdit = useCallback(
    () => dispatch(setEditingId({ section, id: null })),
    [dispatch, section]
  );

  const openForm = useCallback(() => dispatch(openFormAction(section)), [dispatch, section]);
  const closeForm = useCallback(() => dispatch(closeFormAction()), [dispatch]);

  const askConfirm = useCallback(
    (id: string, label: string) => dispatch(askConfirmAction({ section, id, label })),
    [dispatch, section]
  );

  const clearConfirm = useCallback(() => dispatch(clearConfirmAction()), [dispatch]);

  /**
   * Runs a destructive action behind the confirmation dialog: marks it busy so
   * the button cannot be double-fired, reports the outcome on the notice line,
   * and closes the dialog either way.
   */
  const runConfirmed = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      dispatch(setConfirmBusy(true));
      try {
        await action();
        dispatch(setNotice({ section, notice: { type: 'ok', text: successMessage } }));
      } catch (err: any) {
        dispatch(
          setNotice({
            section,
            notice: { type: 'error', text: err?.message || 'Action failed.' },
          })
        );
      } finally {
        dispatch(clearConfirmAction());
      }
    },
    [dispatch, section]
  );

  const flash = useCallback(
    (notice: AdminNotice | null) => dispatch(setNotice({ section, notice })),
    [dispatch, section]
  );

  return useMemo(
    () => ({
      filters,
      updateFilter,
      clearFilters,
      editingId,
      beginEdit,
      endEdit,
      isFormOpen,
      openForm,
      closeForm,
      confirming,
      askConfirm,
      clearConfirm,
      confirmBusy,
      runConfirmed,
      notice,
      flash,
    }),
    [
      filters,
      updateFilter,
      clearFilters,
      editingId,
      beginEdit,
      endEdit,
      isFormOpen,
      openForm,
      closeForm,
      confirming,
      askConfirm,
      clearConfirm,
      confirmBusy,
      runConfirmed,
      notice,
      flash,
    ]
  );
}

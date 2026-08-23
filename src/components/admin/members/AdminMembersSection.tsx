'use client';

import React, { useState } from 'react';
import { Users, Plus, Shield, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import type { Member } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetMembersQuery,
  useGetVillagesQuery,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} from '@/src/store/api/adminApi';
import { selectFilteredMembers, selectEditingMember } from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import {
  ConfirmDialog,
  FilterDate,
  FilterSelect,
  NoticeBanner,
  SearchInput,
  SectionHeader,
  SectionShell,
  SectionSkeleton,
  adminCardClass,
} from '../section-ui';
import { MemberCreateModal } from './MemberCreateModal';
import { MemberEditorModal } from './MemberEditorModal';
import { MemberPermissionsModal } from '@/src/components/modals/MemberPermissionsModal';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

/**
 * The members directory.
 *
 * This was one of fifteen `{activeTab === '…' && (…)}` blocks inside
 * AdminPanel. Every admin route mounted all of them, so opening /admin/settings
 * still shipped and evaluated the members table, the grievance list and every
 * other section's markup. Each section is its own component now, and its route
 * loads only it.
 */
export const AdminMembersSection: React.FC = () => {
  const { filters, updateFilter, beginEdit, endEdit, isFormOpen, openForm, closeForm, confirming, askConfirm, clearConfirm, confirmBusy, runConfirmed, notice } =
    useAdminSection('members');

  const { data: members = [], isLoading, isFetching, refetch } = useGetMembersQuery();
  const { data: villages = [] } = useGetVillagesQuery();
  const [deleteMember] = useDeleteMemberMutation();
  const [updateMember] = useUpdateMemberMutation();

  const filteredMembers = useAppSelector(selectFilteredMembers);
  const editingMember = useAppSelector(selectEditingMember);
  const villageSettings = useAppSelector((s) => s.village?.settings);

  // Permissions open on a member rather than a section, so it stays local.
  const [permissionsMember, setPermissionsMember] = useState<Member | null>(null);

  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <SectionShell>
      <SectionHeader
        icon={Users}
        title="Members Directory & Access Control"
        description={`${members.length} registered members total · ${pendingCount} pending verification`}
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Member
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search by member name or mobile..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            aria-label="Filter by village"
            value={filters.village}
            onChange={(v) => updateFilter('village', v)}
            options={[
              { value: 'ALL', label: 'All Villages' },
              ...villages.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <FilterSelect
            aria-label="Filter by status"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            aria-label="Filter by role"
            value={filters.role}
            onChange={(v) => updateFilter('role', v)}
            options={ROLE_OPTIONS}
          />
          <FilterDate
            value={filters.date}
            onChange={(v) => updateFilter('date', v)}
            placeholder="Joined Date"
          />
        </div>
      </div>

      {isLoading ? (
        <SectionSkeleton variant="table" />
      ) : (
        <div className={`${adminCardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#16161a] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#222328]">
                <tr>
                  <th className="py-3 px-4">Member Profile</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Village Chapter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f24] text-slate-700 dark:text-zinc-300">
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                      No members match these filters.
                    </td>
                  </tr>
                )}
                {filteredMembers.map((mem) => {
                  const memVillage = villages.find((v) => v.id === mem.villageId);
                  return (
                    <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-[#18181d] transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white">
                            {mem.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{mem.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              ID: {mem.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{mem.mobile}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={mem.role === 'SUPER_ADMIN' ? 'destructive' : mem.role === 'ADMIN' ? 'warning' : 'outline'}
                          className="text-[10px] font-bold"
                        >
                          {mem.role || 'MEMBER'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                        {memVillage?.name || 'Main Unit'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={mem.status === 'active' ? 'emerald' : 'warning'}
                          className="text-[10px]"
                        >
                          {mem.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-zinc-500 text-[11px]">
                        {mem.createdAt?.split('T')[0] || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {mem.status === 'pending' && (
                          <button
                            onClick={() =>
                              updateMember({ id: mem.id, updates: { status: 'active' } })
                            }
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => setPermissionsMember(mem)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                          title="Manage Permissions"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => beginEdit(mem.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => askConfirm(mem.id, mem.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MemberCreateModal
        isOpen={isFormOpen}
        villages={villages}
        defaultVillageId={villageSettings?.id || villages[0]?.id || '1'}
        defaultState={villageSettings?.state || 'Uttar Pradesh'}
        defaultDistrict={villageSettings?.district || 'Jaunpur'}
        onClose={closeForm}
      />

      <MemberEditorModal member={editingMember} villages={villages} onClose={endEdit} />

      <MemberPermissionsModal
        isOpen={Boolean(permissionsMember)}
        member={permissionsMember}
        onClose={() => setPermissionsMember(null)}
      />

      <ConfirmDialog
        target={
          confirming ? { title: 'Remove member?', label: confirming.label, run: () => {} } : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(
            () => deleteMember(confirming.id).unwrap(),
            `${confirming.label} was removed.`
          )
        }
      />
    </SectionShell>
  );
};

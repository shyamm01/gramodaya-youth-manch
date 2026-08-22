'use client';

import React from 'react';
import { X, UserPlus, AlertTriangle, HeartHandshake, Volume2, Calendar, Globe } from 'lucide-react';

interface AdminQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string, triggerCreate?: boolean) => void;
}

export const AdminQuickCreateModal: React.FC<AdminQuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'members',
      label: 'Add New Member',
      sub: 'Register a community member',
      icon: UserPlus,
      color: 'emerald',
    },
    {
      id: 'problems',
      label: 'Log Grievance',
      sub: 'Report a civic problem',
      icon: AlertTriangle,
      color: 'rose',
    },
    {
      id: 'social-work',
      label: 'Add Social Work',
      sub: 'Record development project',
      icon: HeartHandshake,
      color: 'amber',
    },
    {
      id: 'announcements',
      label: 'Publish Notice',
      sub: 'Broadcast an announcement',
      icon: Volume2,
      color: 'blue',
    },
    {
      id: 'events',
      label: 'Schedule Event',
      sub: 'Create meeting or campaign',
      icon: Calendar,
      color: 'purple',
    },
    {
      id: 'villages',
      label: 'Register Village',
      sub: 'Add new village branch',
      icon: Globe,
      color: 'slate',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Quick Create
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Select an action module to create a record immediately
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id, true);
                  onClose();
                }}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#1c1d22] dark:hover:bg-[#24262d] text-slate-900 dark:text-white rounded-2xl text-left border border-slate-200/80 dark:border-transparent transition flex flex-col gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                    {act.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    {act.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

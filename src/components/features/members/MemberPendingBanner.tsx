'use client';

import React from 'react';
import { Shield, Check } from 'lucide-react';
import { Card, Button } from '../../ui';
import { Member } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface MemberPendingBannerProps {
  pendingMembers: Member[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}

export const MemberPendingBanner: React.FC<MemberPendingBannerProps> = ({
  pendingMembers,
  onApprove,
  onDelete,
  onViewAll,
}) => {
  const { t } = useApp();

  if (!pendingMembers || pendingMembers.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-[#111726] border border-amber-400/50 dark:border-amber-700/50 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t('members.pendingReviewTitle', { count: pendingMembers.length })}</span>
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
        >
          {t('common.viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pendingMembers.slice(0, 3).map((m) => (
          <Card key={m.id} className="p-3 flex items-center justify-between rounded-xl bg-white dark:bg-[#0B0F17] border-amber-200 dark:border-amber-900/60">
            <div className="min-w-0 pr-2">
              <p className="font-bold text-xs text-[#2C3327] dark:text-white truncate">{m.name}</p>
              <p className="text-[10px] text-[#8C8675] dark:text-slate-400 font-mono">{m.mobile}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                size="xs"
                variant="default"
                onClick={() => onApprove(m.id)}
                className="h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer"
              >
                <Check className="w-3 h-3 mr-1" />
                <span>{t('members.approveBtn')}</span>
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => onDelete(m.id)}
                className="h-7 px-2 text-[11px] font-bold rounded-lg cursor-pointer"
              >
                {t('members.deleteBtn')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

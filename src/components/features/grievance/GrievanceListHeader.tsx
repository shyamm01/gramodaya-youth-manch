'use client';

import React from 'react';
import { AlertTriangle, Plus, TrendingUp } from 'lucide-react';
import { Button } from '../../ui';

interface GrievanceListHeaderProps {
  totalCount: number;
  resolvedCount: number;
  newCount: number;
  t: (key: string, opts?: any) => string;
  lang: string;
  onRegisterNew: () => void;
}

export const GrievanceListHeader: React.FC<GrievanceListHeaderProps> = ({
  totalCount,
  resolvedCount,
  newCount,
  t,
  lang,
  onRegisterNew,
}) => {
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            {newCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white dark:ring-[#0B0F17] animate-pulse">
                {newCount > 99 ? '99+' : newCount}
              </span>
            )}
          </div>
          <span>{t('nav.problems')}</span>
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-4 text-xs text-[#8C8675] dark:text-slate-400 font-medium">
            <span>
              <span className="font-bold text-[#2C3327] dark:text-white">{totalCount}</span>{' '}
              {lang === 'en' ? 'Total' : 'कुल'}
            </span>
            <span className="w-px h-3 bg-[#E0DCCF] dark:bg-slate-700" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {resolvedCount} {t('common.resolved')}
            </span>
            {totalCount > 0 && (
              <>
                <span className="w-px h-3 bg-[#E0DCCF] dark:bg-slate-700" />
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-bold">{resolutionRate}%</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="amber"
        size="default"
        onClick={onRegisterNew}
        className="rounded-xl font-bold cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <Plus className="w-4 h-4 mr-1" />
        <span>{t('problems.registerNewBtn')}</span>
      </Button>
    </div>
  );
};

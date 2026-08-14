'use client';

import React from 'react';
import { Search, X, Image as ImageIcon, Shield } from 'lucide-react';
import { Input } from '../../ui';
import { useApp } from '../../../context/AppContext';

interface MemberSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: 'ALL' | 'WITH_PHOTO' | 'PENDING';
  onFilterChange: (filter: 'ALL' | 'WITH_PHOTO' | 'PENDING') => void;
  activeCount: number;
  withPhotoCount: number;
  pendingCount: number;
  isAdminLoggedIn: boolean;
}

export const MemberSearchFilter: React.FC<MemberSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeCount,
  withPhotoCount,
  pendingCount,
  isAdminLoggedIn,
}) => {
  const { t } = useApp();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-[#111726] p-3 sm:p-4 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="h-4 w-4 text-[#8C8675] dark:text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('members.searchPlaceholder')}
          className="pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border-[#E0DCCF] dark:border-slate-800 bg-[#FBF9F5] dark:bg-[#0B0F17] focus:bg-white dark:focus:bg-[#0D131F] transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-3 text-[#8C8675] hover:text-[#2C3327] dark:hover:text-white p-0.5 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          onClick={() => onFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'ALL'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-[#F4F1EA] dark:bg-[#0B0F17] text-[#636054] dark:text-slate-400 hover:bg-[#EAE6DC] dark:hover:bg-[#151D2E]'
          }`}
        >
          {t('members.filterAll', { count: activeCount })}
        </button>

        <button
          onClick={() => onFilterChange('WITH_PHOTO')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'WITH_PHOTO'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-[#F4F1EA] dark:bg-[#0B0F17] text-[#636054] dark:text-slate-400 hover:bg-[#EAE6DC] dark:hover:bg-[#151D2E]'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          <span>{t('members.filterWithPhoto', { count: withPhotoCount })}</span>
        </button>

        {isAdminLoggedIn && pendingCount > 0 && (
          <button
            onClick={() => onFilterChange('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{t('members.filterPending', { count: pendingCount })}</span>
          </button>
        )}
      </div>
    </div>
  );
};

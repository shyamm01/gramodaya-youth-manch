'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { Badge } from '@/src/components/ui/badge';
import { AdminLocationSelector } from './AdminLocationSelector';
import { Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminNavbarProps {
  activeTab: string;
  onOpenMobileSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeTab,
  onOpenMobileSidebar,
}) => {
  const { isSuperAdmin } = useApp();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#202024] transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <span className="text-slate-400 dark:text-zinc-600">Super Admin</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold capitalize">
            {activeTab.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* State, District & Village Multi-Scope Selector */}
        {isSuperAdmin && (
          <div className="hidden md:block">
            <AdminLocationSelector compact />
          </div>
        )}

        <Badge
          variant="emerald"
          className="hidden xl:inline-flex bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-mono text-[10px]"
        >
          ● Realtime Active
        </Badge>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Back to Public Portal Link */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Portal</span>
        </Link>
      </div>
    </header>
  );
};

'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useAppDispatch } from '@/src/store/hooks';
import { setActiveTab } from '@/src/store/slices/adminUiSlice';
import { AdminLayout } from './AdminLayout';
import { AdminUnauthorizedSection } from './AdminUnauthorizedSection';
import { resolveAdminAccess } from '../access/adminAccessPolicy';

/**
 * The chrome and the gate every admin route shares.
 *
 * Each route used to render AdminPanel with an `initialTab` prop, so all
 * nineteen of them mounted the same 3,853-line component and rendered one
 * fifteenth of it. The tab now comes from the route itself and the section is
 * whatever the route chose to put in `children`, which is what lets Next code
 * split the panel: /admin/settings ships the settings screen, not the members
 * table and the grievance list as well.
 */
export const AdminShell: React.FC<{ tab: string; children: React.ReactNode }> = ({
  tab,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { authSession } = useApp();

  // The sidebar highlight and the quick-create target read the active tab from
  // the store; the route is what sets it.
  useEffect(() => {
    dispatch(setActiveTab(tab));
  }, [dispatch, tab]);

  const handleTabChange = (nextTab: string) => {
    const target = nextTab === 'dashboard' ? '/admin' : `/admin/${nextTab}`;
    if (pathname !== target) router.push(target);
  };

  const access = useMemo(() => resolveAdminAccess(tab, authSession), [tab, authSession]);

  if (!authSession || !authSession.isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-[#27272a] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              This console is restricted to signed-in administrators.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl shadow cursor-pointer transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={tab} setActiveTab={handleTabChange}>
      {access.authorized ? (
        children
      ) : (
        <AdminUnauthorizedSection
          tabName={tab}
          requiredCapability={access.requiredCapability}
          description={access.description}
        />
      )}
    </AdminLayout>
  );
};

'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useAppDispatch } from '@/src/store/hooks';
import { setActiveTab, openForm } from '@/src/store/slices/adminUiSlice';
import { AdminLayout } from './AdminLayout';
import { AdminUnauthorizedSection } from './AdminUnauthorizedSection';
import { deriveAdminTab, adminTabToPath, TAB_TO_SECTION } from './adminTabs';
import { resolveAdminAccess } from '../access/adminAccessPolicy';

/**
 * The chrome and the gate around every admin screen.
 *
 * This lives in app/admin/layout.tsx rather than inside each page, which is
 * what makes it survive navigation. Next keeps a layout mounted while the page
 * beneath it swaps, so the sidebar's collapsed/expanded state, its open
 * accordions and the scroll position all persist across a nav — when this sat
 * inside the page, every link click remounted the sidebar and sprang it back
 * open.
 *
 * The tab comes from the URL instead of a prop, so a page is now just its
 * section component and there is nothing to keep in sync.
 */
export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { authSession } = useApp();

  const tab = useMemo(() => deriveAdminTab(pathname), [pathname]);

  // The sidebar highlight and the section widgets read the active tab from the
  // store; the URL is what sets it.
  useEffect(() => {
    dispatch(setActiveTab(tab));
  }, [dispatch, tab]);

  const handleTabChange = (nextTab: string) => {
    const target = adminTabToPath(nextTab);
    if (pathname !== target) router.push(target);
  };

  /**
   * Quick create navigates to the section and opens its create form.
   *
   * The form's open state lives in adminUi, so the shell can raise it on a
   * section it does not import and has not mounted yet — the section reads
   * `isFormOpen` when it arrives. Only members was ever wired up before, and
   * only because AdminPanel happened to own that modal's useState.
   */
  const handleQuickCreate = (nextTab: string) => {
    const section = TAB_TO_SECTION[nextTab];
    if (section) dispatch(openForm(section));
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
    <AdminLayout
      activeTab={tab}
      setActiveTab={handleTabChange}
      onTriggerQuickCreateAction={handleQuickCreate}
    >
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

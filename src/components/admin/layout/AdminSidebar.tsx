'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';
import { hasUserPermission, isSuperAdmin as checkIsSuperAdmin } from '@/src/lib/permissions';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  HeartHandshake,
  Volume2,
  Calendar,
  Image as ImageIcon,
  LogOut,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Award,
  GraduationCap,
  Globe,
  PhoneCall,
  Database,
  Key,
  Settings,
  X,
  Layers,
  KeyRound,
  ChevronDown,
  ChevronRight,
  Activity,
  UserCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  onOpenQuickCreate: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onOpenQuickCreate,
}) => {
  const { villages, adminLogout, authSession, isSuperAdmin: contextIsSuperAdmin, stats } = useApp();

  // Accordion open/collapse states
  const [usersAccordionOpen, setUsersAccordionOpen] = useState<boolean>(true);
  const [settingsAccordionOpen, setSettingsAccordionOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role resolution
  const isSuper = Boolean(
    contextIsSuperAdmin ||
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  const isAdminRole = Boolean(
    !mounted ||
    isSuper ||
    authSession.isAdminLoggedIn ||
    authSession.role === 'ADMIN' ||
    authSession.systemRole === 'ADMIN'
  );

  // User & Permissions Accordion Children (filtered by role & permission)
  const userAccordionChildren = useMemo(() => {
    const items = [
      {
        id: 'members',
        label: 'Members',
        icon: Users,
        count: stats.pendingMembers ? `${stats.pendingMembers} pending` : null,
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'members:view'),
      },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: ShieldCheck,
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'permissions:manage'),
      },
      {
        id: 'modules',
        label: 'Modules',
        icon: Layers,
        visible: isSuper || isAdminRole,
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: KeyRound,
        visible: isSuper || isAdminRole,
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        icon: Activity,
        visible: isSuper || hasUserPermission(authSession, 'audit:view'),
      },
    ];
    return items.filter((item) => item.visible);
  }, [isSuper, isAdminRole, authSession, stats.pendingMembers]);

  // Operational Navigation Items (filtered by role & permission)
  const operationalItems = useMemo(() => {
    const items = [
      {
        id: 'helpdesk',
        label: 'Admin Helpdesk',
        icon: MessageSquare,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'helpdesk:manage'),
      },
      {
        id: 'problems',
        label: 'Grievances',
        icon: AlertTriangle,
        count: stats.newProblems > 0 ? stats.newProblems : null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'complaints:view'),
      },
      {
        id: 'social-work',
        label: 'Social Works',
        icon: HeartHandshake,
        count: stats.pendingSocialWork > 0 ? stats.pendingSocialWork : null,
        badgeColor: 'bg-amber-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'social_works:manage'),
      },
      {
        id: 'announcements',
        label: 'Announcements',
        icon: Volume2,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'announcements:manage'),
      },
      {
        id: 'events',
        label: 'Events & Plans',
        icon: Calendar,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'events:manage'),
      },
      {
        id: 'education',
        label: 'Education',
        icon: GraduationCap,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'education:manage'),
      },
      {
        id: 'villages',
        label: 'Villages & Units',
        icon: Globe,
        count: villages.length > 0 ? villages.length : null,
        badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        visible: isSuper || isAdminRole,
      },
      {
        id: 'gallery',
        label: 'Media Gallery',
        icon: ImageIcon,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'gallery:upload'),
      },
      {
        id: 'elders',
        label: 'Elder Honors',
        icon: Award,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'elders:manage'),
      },
      {
        id: 'helpline',
        label: 'Helpline Dir',
        icon: PhoneCall,
        count: null,
        badgeColor: 'bg-rose-500',
        visible: isSuper || isAdminRole,
      },
    ];
    return items.filter((item) => item.visible);
  }, [isSuper, isAdminRole, authSession, stats, villages.length]);

  // Settings Accordion Children (filtered by role & permission)
  const settingsAccordionChildren = useMemo(() => {
    const items = [
      {
        id: 'settings',
        label: 'General Settings',
        icon: Settings,
        visible: isSuper || isAdminRole || hasUserPermission(authSession, 'village:settings:update'),
      },
      {
        id: 'supabase-setup',
        label: 'Database Setup',
        icon: Database,
        visible: isSuper,
      },
      {
        id: 'api-integrations',
        label: 'API Integrations',
        icon: Key,
        visible: isSuper,
      },
    ];
    return items.filter((item) => item.visible);
  }, [isSuper, isAdminRole, authSession]);

  // Auto-expand accordion if child tab is active
  useEffect(() => {
    if (['members', 'permissions', 'modules', 'roles', 'audit', 'permissions-modules', 'permissions-roles', 'security'].includes(activeTab)) {
      setUsersAccordionOpen(true);
    }
    if (['settings', 'supabase-setup', 'api-integrations'].includes(activeTab)) {
      setSettingsAccordionOpen(true);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const isUserChildActive = ['members', 'permissions', 'modules', 'roles', 'audit', 'permissions-modules', 'permissions-roles', 'security'].includes(activeTab);
  const isSettingsChildActive = ['settings', 'supabase-setup', 'api-integrations'].includes(activeTab);

  return (
    <>
      {/* ── MOBILE DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#F8F6F0] dark:bg-[#070B12] border-r border-[#E2DDD3] dark:border-slate-800/80 p-4 space-y-4 z-10 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                    Gramodaya Youth Manch
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono">Executive Console</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 scrollbar-thin">
              {/* Dashboard */}
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </button>

              {/* Accordion: User & Permissions (Only if visible children exist) */}
              {userAccordionChildren.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setUsersAccordionOpen(!usersAccordionOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      isUserChildActive
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>User & Permissions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {stats.pendingMembers > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                          {stats.pendingMembers}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ease-in-out ${
                          usersAccordionOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Smooth Animated Accordion Container */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      usersAccordionOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-purple-200 dark:border-purple-900/60 ml-4">
                        {userAccordionChildren.map((child) => {
                          const isActive = activeTab === child.id;
                          const Icon = child.icon;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleTabClick(child.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                                isActive
                                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </div>
                              {child.count && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                                  {child.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Navigation Items */}
              <div className="pt-2 space-y-1">
                {operationalItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black text-white ${item.badgeColor || 'bg-rose-500'}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Accordion: Settings (Only if visible children exist) */}
              {settingsAccordionChildren.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSettingsAccordionOpen(!settingsAccordionOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      isSettingsChildActive
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>System Settings</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ease-in-out ${
                        settingsAccordionOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {/* Smooth Animated Accordion Container */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      settingsAccordionOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-purple-200 dark:border-purple-900/60 ml-4">
                        {settingsAccordionChildren.map((child) => {
                          const isActive = activeTab === child.id;
                          const Icon = child.icon;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleTabClick(child.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                                isActive
                                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col bg-[#F8F6F0] dark:bg-[#070B14] border-r border-[#E4DFD5] dark:border-slate-800/80 transition-all duration-300 ease-in-out flex-shrink-0 relative z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4DFD5] dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                  Gramodaya Youth
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  Executive Suite
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            title={!sidebarOpen ? 'Dashboard' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* 2. ACCORDION: User & Permissions (Only if visible children exist) */}
          {userAccordionChildren.length > 0 && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (!sidebarOpen) setSidebarOpen(true);
                  setUsersAccordionOpen(!usersAccordionOpen);
                }}
                title={!sidebarOpen ? 'User & Permissions' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  isUserChildActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">User & Permissions</span>}
                </div>

                {sidebarOpen && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {stats.pendingMembers > 0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                        {stats.pendingMembers}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-300 ease-in-out ${
                        usersAccordionOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Accordion Children opened directly BELOW with smooth height & opacity transition */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  sidebarOpen && usersAccordionOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pl-4 pr-1 py-1 space-y-1 ml-3 border-l-2 border-purple-200 dark:border-purple-900/60">
                    {userAccordionChildren.map((child) => {
                      const isActive = activeTab === child.id;
                      const Icon = child.icon;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleTabClick(child.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition text-left cursor-pointer group ${
                            isActive
                              ? 'bg-purple-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 truncate">
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-500/80'}`} />
                            <span className="truncate text-[11px]">{child.label}</span>
                          </div>

                          {child.count && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold flex-shrink-0">
                              {child.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operational Module Items */}
          {operationalItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && item.count && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black text-white ${item.badgeColor || 'bg-rose-500'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* ACCORDION: System Settings (Only if visible children exist) */}
          {settingsAccordionChildren.length > 0 && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (!sidebarOpen) setSidebarOpen(true);
                  setSettingsAccordionOpen(!settingsAccordionOpen);
                }}
                title={!sidebarOpen ? 'System Settings' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  isSettingsChildActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">System Settings</span>}
                </div>

                {sidebarOpen && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-300 ease-in-out ${
                      settingsAccordionOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                )}
              </button>

              {/* Settings Accordion Children with smooth height & opacity transition */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  sidebarOpen && settingsAccordionOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pl-4 pr-1 py-1 space-y-1 ml-3 border-l-2 border-purple-200 dark:border-purple-900/60">
                    {settingsAccordionChildren.map((child) => {
                      const isActive = activeTab === child.id;
                      const Icon = child.icon;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleTabClick(child.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition text-left cursor-pointer ${
                            isActive
                              ? 'bg-purple-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 font-medium'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-500/80'}`} />
                          <span className="truncate text-[11px]">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Quick Create & Sign Out */}
        <div className="p-3 border-t border-[#E4DFD5] dark:border-slate-800/80 space-y-2">
          {isSuper && (
            <button
              type="button"
              onClick={onOpenQuickCreate}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs cursor-pointer ${
                !sidebarOpen ? 'px-0' : 'px-3'
              }`}
              title={!sidebarOpen ? 'Quick Create' : undefined}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Quick Create</span>}
            </button>
          )}

          <button
            type="button"
            onClick={adminLogout}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition cursor-pointer ${
              !sidebarOpen ? 'px-0' : 'px-3'
            }`}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

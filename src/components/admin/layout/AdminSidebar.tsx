'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();
  const { villages, stats, adminLogout } = useApp();

  // Accordion open/collapse states
  const [usersAccordionOpen, setUsersAccordionOpen] = useState<boolean>(true);
  const [settingsAccordionOpen, setSettingsAccordionOpen] = useState<boolean>(false);

  // Auto-expand accordion if child tab is active
  useEffect(() => {
    if (['members', 'permissions', 'permissions-modules', 'permissions-roles', 'security'].includes(activeTab)) {
      setUsersAccordionOpen(true);
    }
    if (['settings', 'supabase-setup', 'api-integrations'].includes(activeTab)) {
      setSettingsAccordionOpen(true);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const basePath = pathname.startsWith('/admin') ? '/admin' : '/super-admin';
    let targetUrl = basePath;

    if (tabId === 'permissions-modules') {
      targetUrl = `${basePath}/permissions/modules`;
    } else if (tabId === 'permissions-roles') {
      targetUrl = `${basePath}/permissions/roles`;
    } else if (tabId !== 'dashboard') {
      targetUrl = `${basePath}/${tabId}`;
    }

    if (pathname !== targetUrl) {
      router.push(targetUrl);
    }
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  // User & Permissions Accordion Children
  const userAccordionChildren = [
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      count: stats.pendingMembers ? `${stats.pendingMembers} pending` : null,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: ShieldCheck,
    },
    {
      id: 'modules',
      label: 'Modules',
      icon: Layers,
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: KeyRound,
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: Activity,
    },
  ];

  // Settings Accordion Children
  const settingsAccordionChildren = [
    {
      id: 'settings',
      label: 'General Settings',
      icon: Settings,
    },
    {
      id: 'supabase-setup',
      label: 'Database Setup',
      icon: Database,
    },
    {
      id: 'api-integrations',
      label: 'API Integrations',
      icon: Key,
    },
  ];

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

              {/* Accordion: User & Permissions */}
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

              {/* Other Navigation Items */}
              <div className="pt-2 space-y-1">
                {[
                  { id: 'helpdesk', label: 'Admin Helpdesk', icon: MessageSquare, count: null },
                  { id: 'problems', label: 'Grievances', icon: AlertTriangle, count: stats.newProblems },
                  { id: 'social-work', label: 'Social Works', icon: HeartHandshake, count: stats.pendingSocialWork },
                  { id: 'announcements', label: 'Announcements', icon: Volume2, count: null },
                  { id: 'events', label: 'Events & Plans', icon: Calendar, count: null },
                  { id: 'education', label: 'Education', icon: GraduationCap, count: null },
                  { id: 'villages', label: 'Villages & Units', icon: Globe, count: villages.length },
                  { id: 'gallery', label: 'Media Gallery', icon: ImageIcon, count: null },
                  { id: 'elders', label: 'Elder Honors', icon: Award, count: null },
                  { id: 'helpline', label: 'Helpline Directory', icon: PhoneCall, count: null },
                ].map((item) => {
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
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Accordion: Settings */}
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
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SINGLE SIDEBAR WITH NESTED ACCORDIONS ── */}
      <aside
        className={`hidden lg:flex h-screen flex-col justify-between bg-[#F8F6F0] dark:bg-[#070B12] border-r border-[#E2DDD3] dark:border-slate-800/80 transition-all duration-300 ease-in-out select-none z-30 ${
          sidebarOpen ? 'w-64' : 'w-18'
        }`}
      >
        {/* Header: Logo & Collapse Button */}
        <div className="p-4 flex items-center justify-between border-b border-[#E2DDD3] dark:border-slate-800/80">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight truncate">
                  Gramodaya Youth
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  Executive Admin Console
                </p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              title="Collapse Sidebar"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Uncollapse button when collapsed */}
        {!sidebarOpen && (
          <div className="pt-2 px-2 flex justify-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Expand Sidebar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation List */}
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

          {/* 2. ACCORDION: User & Permissions */}
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

          {/* 3. Helpdesk */}
          <button
            type="button"
            onClick={() => handleTabClick('helpdesk')}
            title={!sidebarOpen ? 'Admin Helpdesk' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'helpdesk'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Admin Helpdesk</span>}
          </button>

          {/* 4. Grievances */}
          <button
            type="button"
            onClick={() => handleTabClick('problems')}
            title={!sidebarOpen ? 'Grievances' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'problems'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Grievances</span>}
            </div>
            {sidebarOpen && stats.newProblems > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black">
                {stats.newProblems}
              </span>
            )}
          </button>

          {/* 5. Social Works */}
          <button
            type="button"
            onClick={() => handleTabClick('social-work')}
            title={!sidebarOpen ? 'Social Works' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'social-work'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Social Works</span>}
            </div>
            {sidebarOpen && stats.pendingSocialWork > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black">
                {stats.pendingSocialWork}
              </span>
            )}
          </button>

          {/* 6. Announcements */}
          <button
            type="button"
            onClick={() => handleTabClick('announcements')}
            title={!sidebarOpen ? 'Announcements' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <Volume2 className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Announcements</span>}
          </button>

          {/* 7. Events & Plans */}
          <button
            type="button"
            onClick={() => handleTabClick('events')}
            title={!sidebarOpen ? 'Events & Plans' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Events & Plans</span>}
          </button>

          {/* 8. Education */}
          <button
            type="button"
            onClick={() => handleTabClick('education')}
            title={!sidebarOpen ? 'Education' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'education'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <GraduationCap className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Education</span>}
          </button>

          {/* 9. Villages & Units */}
          <button
            type="button"
            onClick={() => handleTabClick('villages')}
            title={!sidebarOpen ? 'Villages & Units' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'villages'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Villages & Units</span>}
            </div>
            {sidebarOpen && villages.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {villages.length}
              </span>
            )}
          </button>

          {/* 10. Media Gallery */}
          <button
            type="button"
            onClick={() => handleTabClick('gallery')}
            title={!sidebarOpen ? 'Media Gallery' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <ImageIcon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Media Gallery</span>}
          </button>

          {/* 11. Elder Honors */}
          <button
            type="button"
            onClick={() => handleTabClick('elders')}
            title={!sidebarOpen ? 'Elder Honors' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'elders'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <Award className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Elder Honors</span>}
          </button>

          {/* 12. Helpline Directory */}
          <button
            type="button"
            onClick={() => handleTabClick('helpline')}
            title={!sidebarOpen ? 'Helpline Directory' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'helpline'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <PhoneCall className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Helpline Dir</span>}
          </button>

          {/* 13. ACCORDION: System Settings */}
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
        </div>

        {/* Footer: Quick Create & Sign Out */}
        <div className="p-3 border-t border-[#E2DDD3] dark:border-slate-800/80 space-y-2">
          {sidebarOpen ? (
            <button
              type="button"
              onClick={onOpenQuickCreate}
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Create</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenQuickCreate}
              title="Quick Create"
              className="w-full py-2 rounded-xl bg-purple-600 text-white flex items-center justify-center transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => adminLogout()}
            title="Sign Out"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

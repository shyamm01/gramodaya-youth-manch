'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import {
  Shield,
  Users,
  AlertTriangle,
  HeartHandshake,
  Volume2,
  Calendar,
  Image as ImageIcon,
  LogOut,
  Plus,
  Mail,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Award,
  Globe,
  PhoneCall,
  Database,
  Key,
  Settings,
  X,
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
  const { villageSettings, villages, stats, authSession, adminLogout } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'members', label: 'Members', icon: Users, count: stats.pendingMembers },
    { id: 'problems', label: 'Grievances', icon: AlertTriangle, count: stats.newProblems },
    { id: 'social-work', label: 'Social Works', icon: HeartHandshake, count: stats.pendingSocialWork },
    { id: 'announcements', label: 'Announcements', icon: Volume2, count: null },
    { id: 'events', label: 'Events & Plans', icon: Calendar, count: null },
  ];

  const managementNavItems = [
    { id: 'villages', label: 'Villages & Units', icon: Globe, count: villages.length },
    { id: 'gallery', label: 'Media & Gallery', icon: ImageIcon, count: null },
    { id: 'elders', label: 'Elder Honors', icon: Award, count: null },
    { id: 'helpline', label: 'Helpline Dir', icon: PhoneCall, count: null },
    { id: 'security', label: 'Security & Audit', icon: Shield, count: null },
    { id: 'supabase-setup', label: 'Database Setup', icon: Database, count: null },
    { id: 'api-integrations', label: 'API Integration', icon: Key, count: null },
    { id: 'settings', label: 'Settings & Reset', icon: Settings, count: null },
  ];

  return (
    <>
      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#0e0e11] border-r border-slate-200 dark:border-[#22242a] p-4 space-y-6 z-10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xs">
                  GY
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  Gramodaya Inc.
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                onOpenQuickCreate();
                setMobileSidebarOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-full flex items-center justify-center gap-2 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Create</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-[#1e1f25] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#16171c]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-white' : 'text-slate-400 dark:text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== null && item.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Management
                </p>
                {managementNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-[#1e1f25] text-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#16171c]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SLEEK SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-50 dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-[#202024] transition-all duration-300 ${
          sidebarOpen ? 'w-64 p-4' : 'w-20 p-3 items-center'
        }`}
      >
        {/* Org Header */}
        <div className="flex items-center justify-between w-full pb-5 mb-2 border-b border-slate-200 dark:border-[#202024]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xs flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white truncate leading-tight">
                  Gramodaya Inc.
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono truncate">
                  {villageSettings.name || 'Main Chapter'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800/60 transition cursor-pointer"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Create Button + Inbox pill */}
        <div className="w-full mb-6">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenQuickCreate}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-full flex items-center justify-center gap-2 shadow transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Create</span>
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className="p-2 bg-white dark:bg-[#18181b] hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded-full border border-slate-200 dark:border-[#27272a] transition cursor-pointer shadow-2xs"
                title="Grievances Inbox"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenQuickCreate}
              className="w-10 h-10 mx-auto rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-black flex items-center justify-center shadow transition cursor-pointer"
              title="Quick Create"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 w-full overflow-y-auto space-y-6 scrollbar-none pr-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'
                  } py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1c1d22] text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/80 dark:border-transparent'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#14151a]'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-white' : 'text-slate-400 dark:text-zinc-400'}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  {sidebarOpen && item.count !== null && item.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                Documents & Management
              </p>
            )}
            {managementNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-start gap-3 px-3.5' : 'justify-center px-0'
                  } py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1c1d22] text-slate-900 dark:text-white font-bold border border-slate-200/80 dark:border-transparent'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#14151a]'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-white' : 'text-slate-400 dark:text-zinc-400'}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile / Logout footer */}
        <div className="w-full pt-4 border-t border-slate-200 dark:border-[#202024] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white flex-shrink-0">
              {authSession.adminName ? authSession.adminName.charAt(0) : 'S'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {authSession.adminName || 'Super Admin'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                  {authSession.adminMobile}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={adminLogout}
              className="p-1.5 text-slate-400 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

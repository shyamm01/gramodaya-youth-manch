'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Users,
  AlertTriangle,
  HeartHandshake,
  Menu,
  X,
  Shield,
  Lock,
  Calendar,
  Image as ImageIcon,
  Award,
  PhoneCall,
  Info,
  MessageSquare,
  Bell,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, authSession } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { href: '/', labelKey: 'nav.home', icon: Home },
    { href: '/education', labelKey: 'nav.education', icon: GraduationCap },
    { href: '/problems', labelKey: 'nav.problems', icon: AlertTriangle },
    { href: '/social-work', labelKey: 'nav.socialWork', icon: HeartHandshake },
  ];

  const drawerLinks = [
    { href: '/employment', labelKey: 'nav.employment', icon: Briefcase },
    { href: '/events', labelKey: 'nav.events', icon: Calendar },
    { href: '/live-chat', labelKey: 'nav.liveChat', icon: MessageSquare },
    { href: '/members', labelKey: 'nav.members', icon: Users },
    { href: '/leadership', labelKey: 'nav.leadership', icon: Users },
    { href: '/elders', labelKey: 'nav.elders', icon: Award },
    { href: '/about', labelKey: 'nav.about', icon: Info },
    { href: '/announcements', labelKey: 'nav.announcements', icon: Bell },
    { href: '/gallery', labelKey: 'nav.gallery', icon: ImageIcon },
    { href: '/helpline', labelKey: 'nav.helpline', icon: PhoneCall },
  ];

  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-[#2D6A4F] dark:bg-[#16222F] text-white p-6 rounded-t-3xl border-t border-[#40916C] dark:border-slate-700 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B4F3D] dark:border-slate-700">
              <h3 className="font-bold text-sm text-amber-400">
                {t('common.more')} / Navigation
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {drawerLinks.map((item) => {
                const Icon = item.icon;
                const active = isCurrent(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition ${
                      active
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-[#1B4332]/60 hover:bg-[#1B4332] text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Access inside Mobile Drawer */}
            <div className="pt-3 border-t border-[#3B4F3D] dark:border-slate-700 space-y-2">
              {authSession.isAdminLoggedIn ? (
                <Link
                  href="/super-admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl text-sm shadow cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t('header.adminPanel')}</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#3B4F3D] hover:bg-[#4B634D] text-amber-300 font-bold rounded-xl text-sm border border-[#4B634D] shadow cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{t('header.adminLogin')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 transition-colors">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isCurrent(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
                  active
                    ? 'text-[#2D6A4F] dark:text-emerald-400 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] tracking-tight">{t(tab.labelKey)}</span>
              </Link>
            );
          })}

          {/* More menu button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t('common.more')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
export default BottomNav;

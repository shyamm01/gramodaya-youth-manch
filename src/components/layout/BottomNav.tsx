'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  Home,
  AlertTriangle,
  HeartHandshake,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useApp();

  // Five destinations, no overflow menu — the secondary links live in the
  // header's mobile menu (SECONDARY_NAV in Header.tsx). Labels come from the
  // one-word `nav.short.*` keys; the full names don't fit a fifth of a phone.
  const mainTabs = [
    { href: '/', labelKey: 'nav.short.home', icon: Home },
    { href: '/education', labelKey: 'nav.short.education', icon: GraduationCap },
    { href: '/problems', labelKey: 'nav.short.problems', icon: AlertTriangle },
    { href: '/social-work', labelKey: 'nav.short.socialWork', icon: HeartHandshake },
    { href: '/employment', labelKey: 'nav.short.employment', icon: Briefcase },
  ];

  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] transition-colors">
      <div className="flex items-stretch max-w-md mx-auto">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isCurrent(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-1 px-1 rounded-2xl transition ${
                active
                  ? 'text-[#2D6A4F] dark:text-emerald-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight w-full text-center truncate">
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNav;

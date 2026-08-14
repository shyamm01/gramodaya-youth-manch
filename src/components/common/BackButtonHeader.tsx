'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Home,
  Users,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Image as ImageIcon,
  PhoneCall,
  Crown,
  Info,
  Volume2,
  Shield,
  MessageSquare,
} from 'lucide-react';

export const BackButtonHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useApp();

  // Completely hidden on homepage
  if (!pathname || pathname === '/') return null;

  const getPageInfo = () => {
    if (pathname.startsWith('/members')) {
      return { title: t('nav.members'), icon: Users, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (pathname.startsWith('/problems')) {
      return { title: t('nav.problems'), icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' };
    }
    if (pathname.startsWith('/social-work')) {
      return { title: t('nav.socialWork'), icon: HeartHandshake, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (pathname.startsWith('/events')) {
      return { title: t('nav.events'), icon: Calendar, color: 'text-purple-600 dark:text-purple-400' };
    }
    if (pathname.startsWith('/announcements')) {
      return { title: t('nav.announcements'), icon: Volume2, color: 'text-blue-600 dark:text-blue-400' };
    }
    if (pathname.startsWith('/gallery')) {
      return { title: t('nav.gallery'), icon: ImageIcon, color: 'text-teal-600 dark:text-teal-400' };
    }
    if (pathname.startsWith('/leadership')) {
      return { title: t('nav.leadership'), icon: Crown, color: 'text-amber-600 dark:text-amber-400' };
    }
    if (pathname.startsWith('/helpline')) {
      return { title: t('nav.helpline'), icon: PhoneCall, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (pathname.startsWith('/elders')) {
      return { title: t('nav.elders'), icon: Users, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (pathname.startsWith('/about')) {
      return { title: t('nav.about'), icon: Info, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (pathname.startsWith('/live-chat')) {
      return { title: t('nav.liveChat'), icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400' };
    }

    return { title: '', icon: Home, color: 'text-emerald-600 dark:text-emerald-400' };
  };

  const { title, icon: Icon, color } = getPageInfo();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    // Only visible on mobile/tablet (md:hidden), completely removed in desktop
    <aside aria-label="Mobile Navigation" className="md:hidden sticky top-14 z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#E0DCCF]/80 dark:border-slate-800/80 px-3 py-2 shadow-2xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Modern Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800/80 dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200 border border-[#E0DCCF] dark:border-slate-700/80 text-xs font-extrabold transition-transform active:scale-95 cursor-pointer shadow-2xs"
          title={lang === 'en' ? 'Go Back' : 'पीछे जाएं'}
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{lang === 'en' ? 'Back' : 'पीछे'}</span>
        </button>

        {/* Centered Page Identifier */}
        {title && (
          <div className="flex items-center gap-1.5 min-w-0 px-2">
            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
            <span className="text-xs font-black text-[#2C3327] dark:text-white truncate">
              {title}
            </span>
          </div>
        )}

        {/* Quick Home Jump */}
        <Link
          href="/"
          className="flex items-center justify-center p-2 rounded-xl bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800/80 dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200 border border-[#E0DCCF] dark:border-slate-700/80 transition-transform active:scale-95 cursor-pointer shadow-2xs"
          title={lang === 'en' ? 'Home' : 'मुख्य पृष्ठ'}
        >
          <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        </Link>
      </div>
    </aside>
  );
};

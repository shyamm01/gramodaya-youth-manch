'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GymLogo } from '../common/GymLogo';
import { SupabaseSetupScreen } from '../features/SupabaseSetupScreen';
import { supabaseUrl } from '../../lib/supabase';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Shield,
  Lock,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  Crown,
  AlertTriangle,
  Heart,
  Bell,
  Calendar,
  Image,
  Phone,
  Info,
  MessageCircle,
  MoreHorizontal,
  Database,
} from 'lucide-react';

// Primary nav — visible in desktop header
const PRIMARY_NAV = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/members', labelKey: 'nav.members', icon: Users },
  { href: '/problems', labelKey: 'nav.problems', icon: AlertTriangle },
  { href: '/social-work', labelKey: 'nav.socialWork', icon: Heart },
  { href: '/events', labelKey: 'nav.events', icon: Calendar },
  { href: '/live-chat', labelKey: 'nav.liveChat', icon: MessageCircle },
];

// Secondary nav — shown in "More" dropdown / mobile menu
const SECONDARY_NAV = [
  { href: '/leadership', labelKey: 'nav.leadership', icon: Crown },
  { href: '/announcements', labelKey: 'nav.announcements', icon: Bell },
  { href: '/gallery', labelKey: 'nav.gallery', icon: Image },
  { href: '/helpline', labelKey: 'nav.helpline', icon: Phone },
  { href: '/about', labelKey: 'nav.about', icon: Info },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    t,
    lang,
    villageSettings,
    authSession,
    currentMemberMobile,
    members,
    setIsAdminLoginModalOpen,
    adminLogout,
    memberLogout,
  } = useApp();

  const isMemberLoggedIn = !!authSession.isMemberLoggedIn && !!currentMemberMobile;
  const currentDigits = currentMemberMobile ? currentMemberMobile.replace(/\D/g, '').slice(-10) : '';
  const currentMemberObj = (isMemberLoggedIn && currentDigits.length >= 10)
    ? members.find((m) => {
        const mDigits = m.mobile ? m.mobile.replace(/\D/g, '').slice(-10) : '';
        return mDigits && mDigits === currentDigits;
      })
    : null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0F172A] border-b border-[#E0DCCF] dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* ── Logo + Name ── */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-[#4B634D] dark:border-emerald-600 group-hover:scale-105 transition-transform">
              <GymLogo className="w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white tracking-tight leading-tight">
                {lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi}
              </h1>
              <p className="text-[10px] text-[#8C8675] dark:text-slate-500 font-semibold leading-none">
                {lang === 'en' ? (villageSettings.slogan || villageSettings.tagline) : villageSettings.sloganHindi}
              </p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {PRIMARY_NAV.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1E3A2F] dark:bg-emerald-900/80 text-white dark:text-emerald-100'
                      : 'text-[#2C3327] dark:text-slate-300 hover:bg-[#F0EDE4] dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(item.labelKey)}
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 150)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  moreDropdownOpen || SECONDARY_NAV.some((n) => isLinkActive(n.href))
                    ? 'bg-[#1E3A2F] dark:bg-emerald-900/80 text-white dark:text-emerald-100'
                    : 'text-[#2C3327] dark:text-slate-300 hover:bg-[#F0EDE4] dark:hover:bg-slate-800'
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#131B2E] border border-[#E0DCCF] dark:border-slate-800 rounded-xl shadow-lg py-1 z-50">
                  {SECONDARY_NAV.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                          active
                            ? 'bg-[#E8F2EC] dark:bg-emerald-950/60 text-[#1E3A2F] dark:text-emerald-200'
                            : 'text-[#2C3327] dark:text-slate-300 hover:bg-[#F7F5F0] dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#8C8675] dark:text-slate-500" />
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5">
            <LanguageSelector compact={true} />
            <ThemeToggle compact={true} />

            {(!supabaseUrl || supabaseUrl.includes('example.supabase')) && (
              <button
                onClick={() => setIsSupabaseSetupOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[#8C8675] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1.5 rounded-lg hover:bg-[#F0EDE4] dark:hover:bg-slate-800 transition cursor-pointer"
                title="Supabase Setup"
              >
                <Database className="w-4 h-4" />
              </button>
            )}

            {authSession.isAdminLoggedIn ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('header.adminPanel')}</span>
                </Link>
                <button
                  onClick={adminLogout}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                  title={t('common.logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : isMemberLoggedIn && currentMemberObj ? (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="truncate max-w-[100px] sm:max-w-[140px]">
                    {currentMemberObj?.name || 'सदस्य'}
                  </span>
                </div>
                <button
                  onClick={memberLogout}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                  title={t('common.logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-2xs active:scale-95"
                title={lang === 'en' ? 'Portal Login' : 'पोर्टल लॉगिन'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Login' : 'लॉगिन'}</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#E2DDD2] dark:hover:bg-slate-700 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown ── */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pt-2 pb-3 border-t border-[#E0DCCF] dark:border-slate-800 grid grid-cols-2 gap-1.5 animate-fade-in">
            {allNav.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-[#1E3A2F] dark:bg-emerald-900/80 text-white'
                      : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#E2DDD2] dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {isSupabaseSetupOpen && (
        <SupabaseSetupScreen onClose={() => setIsSupabaseSetupOpen(false)} />
      )}
    </header>
  );
};

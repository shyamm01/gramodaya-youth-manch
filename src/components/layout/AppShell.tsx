'use client';

import React from 'react';
import { AppProvider, useApp } from '../../context/AppContext';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { BackButtonHeader } from '../common/BackButtonHeader';
import { UnifiedLoginModal } from '../modals/UnifiedLoginModal';
import { MyProfileModal } from '../modals/MyProfileModal';
import { MemberChatModal } from '../modals/MemberChatModal';
import { DigitalIdCard } from '../features/DigitalIdCard';
import { GymLogo } from '../common/GymLogo';
import Link from 'next/link';
import {
  Heart,
  Shield,
  PhoneCall,
  MapPin,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

const ShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    t,
    lang,
    villageSettings,
    isLoading,
    isMyProfileModalOpen,
    setIsMyProfileModalOpen,
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    selectedChatPartner,
    setSelectedChatPartner,
    selectedIdCardMember,
    setSelectedIdCardMember,
    authSession,
    adminLogout,
  } = useApp();

  const footerLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/members', label: t('nav.members') },
    { href: '/problems', label: t('nav.problems') },
    { href: '/social-work', label: t('nav.socialWork') },
    { href: '/events', label: t('nav.events') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/elders', label: t('nav.elders') },
    { href: '/helpline', label: t('nav.helpline') },
    { href: '/about', label: t('nav.about') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors">
        <div className="text-center space-y-4 max-w-sm mx-auto bg-white dark:bg-[#131B2E] p-8 rounded-3xl shadow-sm border border-[#E0DCCF] dark:border-slate-800">
          <div className="w-12 h-12 border-4 border-[#074D31] dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-base font-bold text-[#2C3327] dark:text-white">
              {lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi}
            </h3>
            <p className="text-xs font-semibold text-[#8C8675] dark:text-slate-400 mt-1">
              {t('footer.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors duration-200">
      <Header />
      <BackButtonHeader />

      <main className="flex-1 pb-24 md:pb-12">{children}</main>

      {/* Global Footer */}
      <footer className="bg-[#18281E] dark:bg-[#0A101D] text-white border-t border-[#3B4F3D] dark:border-slate-800 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 border border-[#4B634D]">
                  <GymLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi}</h3>
                  <p className="text-[11px] text-[#E0DCCF]">{lang === 'en' ? villageSettings.orgNameHindi : villageSettings.orgName}</p>
                </div>
              </div>
              <p className="text-xs text-[#E0DCCF] leading-relaxed">
                {lang === 'en' ? (villageSettings.slogan || villageSettings.tagline) : villageSettings.taglineHindi}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {t('header.village')} {lang === 'en' ? villageSettings.name : villageSettings.nameHindi}, {t('header.gramPanchayat')} {lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                {t('footer.quickLinks')}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#E0DCCF]">
                {footerLinks.slice(0, 5).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="hover:text-white hover:underline transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                {t('footer.civicServices')}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#E0DCCF]">
                {footerLinks.slice(5).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="hover:text-white hover:underline transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/live-chat"
                    className="text-amber-300 hover:underline font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{t('footer.liveChat')}</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {t('footer.security')}
              </h4>
              <p className="text-xs text-[#E0DCCF]">
                {t('footer.securityDesc')}
              </p>
              <div className="pt-1">
                {authSession.isAdminLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{t('footer.adminDashboard')}</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdminLoginModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('footer.authAdminLogin')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#3B4F3D] flex flex-col sm:flex-row items-center justify-between text-xs text-[#E0DCCF] gap-2">
            <p>
              © {new Date().getFullYear()} {lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi} ({lang === 'en' ? villageSettings.name : villageSettings.nameHindi}, {lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi})
            </p>
            <p className="flex items-center gap-1">
              <span>{t('footer.dedicated')}</span>
              <Heart className="w-3 h-3 text-red-400 fill-current inline" />
            </p>
          </div>
        </div>
      </footer>

      {/* Persistent Bottom Nav for Mobile */}
      <BottomNav />

      {/* Global Modals */}
      <UnifiedLoginModal />
      <MyProfileModal isOpen={isMyProfileModalOpen} onClose={() => setIsMyProfileModalOpen(false)} />
      {selectedChatPartner && (
        <MemberChatModal initialPartner={selectedChatPartner} onClose={() => setSelectedChatPartner(null)} />
      )}
      {selectedIdCardMember && (
        <DigitalIdCard member={selectedIdCardMember} onClose={() => setSelectedIdCardMember(null)} />
      )}
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <AppProvider>
      <ShellContent>{children}</ShellContent>
    </AppProvider>
  );
};

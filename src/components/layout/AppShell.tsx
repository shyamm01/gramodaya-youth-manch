'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { BackButtonHeader } from '../common/BackButtonHeader';
import { UnifiedLoginModal } from '../modals/UnifiedLoginModal';
import { MyProfileModal } from '../modals/MyProfileModal';
import { MemberChatModal } from '../modals/MemberChatModal';
import { DigitalIdCard } from '../features/DigitalIdCard';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const {
    t,
    lang,
    villageSettings,
    isLoading,
    isMyProfileModalOpen,
    setIsMyProfileModalOpen,
    setIsAdminLoginModalOpen,
    selectedChatPartner,
    setSelectedChatPartner,
    selectedIdCardMember,
    setSelectedIdCardMember,
    authSession,
  } = useApp();

  const isAdminRoute = pathname?.startsWith('/super-admin') || pathname?.startsWith('/admin');
  const isHomePage = pathname === '/' || pathname === '';

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
        <div className="w-16 h-16 rounded-full border-4 border-[#2D6A4F] border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold text-[#1B4332] dark:text-[#E0DCCF]">
          {villageSettings.orgName || 'Gramodaya Youth Manch'}
        </h2>
        <p className="text-sm text-[#40916C] dark:text-[#A3B18A] mt-1">
          {villageSettings.tagline || 'Loading...'}
        </p>
      </div>
    );
  }

  // If this is a Super Admin or Admin dashboard route, completely bypass public Header, BackButtonHeader, BottomNav, and Footer
  if (isAdminRoute) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        {children}

        {/* Global Modals for admin actions */}
        <UnifiedLoginModal />
        <MyProfileModal
          isOpen={isMyProfileModalOpen}
          onClose={() => setIsMyProfileModalOpen(false)}
        />
        {selectedChatPartner && (
          <MemberChatModal
            initialPartner={selectedChatPartner}
            onClose={() => setSelectedChatPartner(null)}
          />
        )}
        {selectedIdCardMember && (
          <DigitalIdCard
            member={selectedIdCardMember}
            onClose={() => setSelectedIdCardMember(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0B0F17] text-[#1E293B] dark:text-[#E0DCCF] transition-colors duration-200">
      <Header />
      <BackButtonHeader />

      <main className={`flex-1 w-full ${isHomePage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'} pb-24 md:pb-8`}>
        {children}
      </main>

      <BottomNav />

      {/* Global Modals */}
      <UnifiedLoginModal />
      <MyProfileModal
        isOpen={isMyProfileModalOpen}
        onClose={() => setIsMyProfileModalOpen(false)}
      />
      {selectedChatPartner && (
        <MemberChatModal
          initialPartner={selectedChatPartner}
          onClose={() => setSelectedChatPartner(null)}
        />
      )}
      {selectedIdCardMember && (
        <DigitalIdCard
          member={selectedIdCardMember}
          onClose={() => setSelectedIdCardMember(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#1B4332] dark:bg-[#0F141C] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-[#2D6A4F] dark:border-[#1E293B] transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-amber-400">
              {lang === 'en'
                ? villageSettings.orgName || 'Gramodaya Youth Manch'
                : villageSettings.orgNameHindi || 'ग्रामोदय युवा मंच'}
            </h3>
            <p className="text-xs text-[#E0DCCF] leading-relaxed">
              {lang === 'en'
                ? villageSettings.tagline || 'Dedicated to rural empowerment, transparency and unity.'
                : villageSettings.taglineHindi || 'ग्राम विकास, पारदर्शिता और एकता को समर्पित।'}{' '}
              {villageSettings.district ? `(${villageSettings.district})` : ''}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-1 text-xs">
              {footerLinks.slice(0, 5).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#E0DCCF] hover:text-white hover:underline transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t('footer.community')}
            </h4>
            <ul className="space-y-1 text-xs">
              {footerLinks.slice(5).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#E0DCCF] hover:text-white hover:underline transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
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
                    href="/super-admin"
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
      </footer>
    </div>
  );
};

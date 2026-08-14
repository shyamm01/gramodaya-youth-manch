'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  AlertCircle,
  Calendar,
  Menu,
  Shield,
  PhoneCall,
  HeartHandshake,
  Image as ImageIcon,
  Volume2,
  UserCheck,
  Info,
  X,
  Lock,
  MessageSquare,
} from 'lucide-react';

import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const {
    t,
    authSession,
    setIsAdminLoginModalOpen,
  } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', labelKey: 'nav.home', icon: Home },
    { href: '/live-chat', labelKey: 'nav.liveChat', icon: MessageSquare },
    { href: '/members', labelKey: 'nav.members', icon: Users },
    { href: '/problems', labelKey: 'nav.problems', icon: AlertCircle },
  ];

  const secondaryNavItems = [
    { href: '/events', labelKey: 'nav.events', icon: Calendar },
    { href: '/leadership', labelKey: 'nav.leadership', icon: UserCheck },
    { href: '/social-work', labelKey: 'nav.socialWork', icon: HeartHandshake },
    { href: '/announcements', labelKey: 'nav.announcements', icon: Volume2 },
    { href: '/gallery', labelKey: 'nav.gallery', icon: ImageIcon },
    { href: '/helpline', labelKey: 'nav.helpline', icon: PhoneCall },
    { href: '/elders', labelKey: 'nav.elders', icon: Users },
    { href: '/about', labelKey: 'nav.about', icon: Info },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Slide-Up Drawer for 'More' Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-fade-in">
          <div className="bg-[#2C3327] dark:bg-[#0F172A] border-t border-[#3B4F3D] dark:border-slate-800 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto text-[#F0EDE4]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#3B4F3D] dark:border-slate-800">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                🌱 {t('nav.about')}
              </h3>
              <div className="flex items-center gap-2">
                <LanguageSelector compact={true} />
                <ThemeToggle compact={true} />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full bg-[#3B4F3D] text-[#E0DCCF] hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                      active
                        ? 'bg-[#3B4F3D] border-[#E0DCCF]/50 text-white'
                        : 'bg-[#232A1F] dark:bg-slate-800 border-[#3B4F3D] dark:border-slate-700 text-[#E0DCCF] hover:bg-[#3B4F3D]/50'
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
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl text-sm shadow cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t('header.adminPanel')}</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsAdminLoginModalOpen(true);
                    setIsMenuOpen(false);
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

      {/* Fixed Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2C3327] dark:bg-[#0A101D] border-t border-[#3B4F3D] dark:border-slate-800 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-amber-400 font-bold' : 'text-[#8C8675] hover:text-[#E0DCCF]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              isMenuOpen ? 'text-amber-400 font-bold' : 'text-[#8C8675] hover:text-[#E0DCCF]'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t('common.all')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

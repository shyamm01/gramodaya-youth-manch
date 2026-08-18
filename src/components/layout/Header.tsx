"use client";
import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GymLogo } from "../common/GymLogo";
import { SupabaseSetupScreen } from "../features/SupabaseSetupScreen";
import { supabaseUrl } from "../../lib/supabase";
import { LanguageSelector } from "../common/LanguageSelector";
import { ThemeToggle } from "../common/ThemeToggle";
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
  User,
  CreditCard,
  ChevronDown,
  Sparkles,
} from "lucide-react";

// Primary nav — visible in desktop header
const PRIMARY_NAV = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/members", labelKey: "nav.members", icon: Users },
  { href: "/problems", labelKey: "nav.problems", icon: AlertTriangle },
  { href: "/social-work", labelKey: "nav.socialWork", icon: Heart },
  { href: "/events", labelKey: "nav.events", icon: Calendar },
  { href: "/live-chat", labelKey: "nav.liveChat", icon: MessageCircle },
];

// Secondary nav — shown in "More" dropdown / mobile menu
const SECONDARY_NAV = [
  { href: "/leadership", labelKey: "nav.leadership", icon: Crown },
  { href: "/announcements", labelKey: "nav.announcements", icon: Bell },
  { href: "/gallery", labelKey: "nav.gallery", icon: Image },
  { href: "/helpline", labelKey: "nav.helpline", icon: Phone },
  { href: "/about", labelKey: "nav.about", icon: Info },
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
    setIsMyProfileModalOpen,
    setSelectedIdCardMember,
    adminLogout,
    memberLogout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin =
    authSession.systemRole === "SUPER_ADMIN" ||
    authSession.role === "SUPER_ADMIN";
  const isAdmin = Boolean(
    authSession.isAdminLoggedIn || authSession.role === "ADMIN" || isSuperAdmin,
  );
  const isLoggedIn = Boolean(
    authSession.isAdminLoggedIn ||
    authSession.isMemberLoggedIn ||
    authSession.token ||
    authSession.currentMember ||
    isAdmin,
  );

  // Resolve current active member details
  const effectiveMobile =
    currentMemberMobile ||
    authSession.adminMobile ||
    authSession.currentMember?.mobile;
  const currentMemberObj =
    authSession.currentMember ||
    members.find((m) => {
      if (!effectiveMobile) return false;
      const cleanM = (m.mobile || "").replace(/\D/g, "").slice(-10);
      const cleanCurr = effectiveMobile.replace(/\D/g, "").slice(-10);
      return (
        cleanM && cleanCurr && cleanCurr.length >= 10 && cleanM === cleanCurr
      );
    }) ||
    (isLoggedIn
      ? {
          id: authSession.adminId || "1",
          name:
            authSession.adminName || (isSuperAdmin ? "Super Admin" : "Admin"),
          mobile: effectiveMobile || "",
          email: authSession.email || "",
          photoUrl: "",
          role: (authSession.role as any) || "ADMIN",
          systemRole:
            (authSession.systemRole as any) ||
            (isSuperAdmin ? "SUPER_ADMIN" : "ADMIN"),
        }
      : null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleOpenIdCard = () => {
    if (currentMemberObj) {
      setSelectedIdCardMember(currentMemberObj as any);
    }
    setProfileDropdownOpen(false);
  };

  const handleOpenProfile = () => {
    setIsMyProfileModalOpen(true);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    if (authSession.isAdminLoggedIn) {
      adminLogout();
    } else {
      memberLogout();
    }
  };

  const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0F172A] border-b border-[#E0DCCF] dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* ── Logo + Name ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-[#4B634D] dark:border-emerald-600 group-hover:scale-105 transition-transform">
              <GymLogo className="w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white tracking-tight leading-tight">
                {lang === "en"
                  ? villageSettings.orgName
                  : villageSettings.orgNameHindi}
              </h1>
              <p className="text-[10px] text-[#8C8675] dark:text-slate-500 font-semibold leading-none">
                {lang === "en"
                  ? villageSettings.slogan || villageSettings.tagline
                  : villageSettings.sloganHindi}
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
                      ? "bg-[#1E3A2F] dark:bg-emerald-900/80 text-white dark:text-emerald-100"
                      : "text-[#2C3327] dark:text-slate-300 hover:bg-[#F0EDE4] dark:hover:bg-slate-800"
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
                  moreDropdownOpen ||
                  SECONDARY_NAV.some((n) => isLinkActive(n.href))
                    ? "bg-[#1E3A2F] dark:bg-emerald-900/80 text-white dark:text-emerald-100"
                    : "text-[#2C3327] dark:text-slate-300 hover:bg-[#F0EDE4] dark:hover:bg-slate-800"
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#131B2E] border border-[#E0DCCF] dark:border-slate-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                            ? "bg-[#E8F2EC] dark:bg-emerald-950/60 text-[#1E3A2F] dark:text-emerald-200"
                            : "text-[#2C3327] dark:text-slate-300 hover:bg-[#F7F5F0] dark:hover:bg-slate-800"
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

            {(!supabaseUrl || supabaseUrl.includes("example.supabase")) && (
              <button
                onClick={() => setIsSupabaseSetupOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[#8C8675] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1.5 rounded-lg hover:bg-[#F0EDE4] dark:hover:bg-slate-800 transition cursor-pointer"
                title="Supabase Setup"
              >
                <Database className="w-4 h-4" />
              </button>
            )}

            {/* ── PROFILE ICON / LOGIN BUTTON ── */}
            {isLoggedIn && currentMemberObj ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl transition-all cursor-pointer border ${
                    profileDropdownOpen
                      ? "bg-emerald-50 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
                      : "bg-[#F7F5F0] dark:bg-slate-800/80 border-[#E0DCCF] dark:border-slate-700 hover:bg-emerald-50/70 dark:hover:bg-slate-800"
                  }`}
                  aria-label="User Profile Menu"
                >
                  <div className="relative">
                    {currentMemberObj.photoUrl ? (
                      <img
                        src={currentMemberObj.photoUrl}
                        alt={currentMemberObj.name}
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30"
                      />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                          isSuperAdmin
                            ? "bg-gradient-to-tr from-amber-600 to-amber-500 shadow-xs"
                            : isAdmin
                              ? "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xs"
                              : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xs"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900 animate-pulse" />
                  </div>

                  <div className="hidden md:flex flex-col items-start text-left leading-tight pr-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[110px]">
                      {currentMemberObj.name ||
                        (lang === "en" ? "Member" : "सदस्य")}
                    </span>
                    <span
                      className={`text-[9px] font-semibold tracking-wider uppercase ${
                        isSuperAdmin
                          ? "text-amber-600 dark:text-amber-400"
                          : isAdmin
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isSuperAdmin
                        ? "Super Admin"
                        : isAdmin
                          ? "Admin"
                          : "Member"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-slate-800/80">
                    {/* Header Info */}
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0 ${
                            isSuperAdmin
                              ? "bg-gradient-to-tr from-amber-600 to-amber-500"
                              : isAdmin
                                ? "bg-gradient-to-tr from-blue-600 to-indigo-500"
                                : "bg-gradient-to-tr from-emerald-600 to-teal-500"
                          }`}
                        >
                          {currentMemberObj.photoUrl ? (
                            <img
                              src={currentMemberObj.photoUrl}
                              alt={currentMemberObj.name}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentMemberObj.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {currentMemberObj.email || currentMemberObj.mobile}
                          </p>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md mt-0.5 ${
                              isSuperAdmin
                                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                                : isAdmin
                                  ? "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300"
                                  : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                            }`}
                          >
                            {isSuperAdmin
                              ? "मुख्य प्रशासक (Super Admin)"
                              : isAdmin
                                ? "ग्राम प्रशासक (Admin)"
                                : "सदस्य (Member)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer text-left"
                      >
                        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>
                          {lang === "en" ? "Dashboard & Profile" : "डैशबोर्ड व प्रोफ़ाइल"}
                        </span>
                      </Link>

                      <button
                        onClick={handleOpenProfile}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer text-left"
                      >
                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {lang === "en" ? "Member Details" : "मेरी प्रोफाइल"}
                        </span>
                      </button>

                      <button
                        onClick={handleOpenIdCard}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer text-left"
                      >
                        <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>
                          {lang === "en"
                            ? "Digital ID Card"
                            : "डिजिटल पहचान पत्र"}
                        </span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 px-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("common.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-2xs active:scale-95"
                  title={lang === "en" ? "Sign In" : "लॉगिन करें"}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Sign In" : "लॉगिन"}</span>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#E2DDD2] dark:hover:bg-slate-700 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
                      ? "bg-[#1E3A2F] dark:bg-emerald-900/80 text-white"
                      : "bg-[#F7F5F0] dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#E2DDD2] dark:hover:bg-slate-700"
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

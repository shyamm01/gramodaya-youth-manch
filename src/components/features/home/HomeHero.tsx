"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  Calendar,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Send,
} from "lucide-react";
import { VillageBadge } from "../../common";
import { Skeleton } from "../../ui";
import { useApp } from "../../../context/AppContext";

interface HomeHeroProps {
  isLoggedIn?: boolean;
  onJoinClick?: () => void;
  onAddMemberClick?: () => void;
  activeMembersCount: number;
  resolvedComplaintsCount: number;
  socialWorksCount: number;
  eventsCount: number;
  /** True only until the /api/home/stats card has data for the first time. */
  statsLoading?: boolean;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  isLoggedIn = false,
  onJoinClick,
  onAddMemberClick,
  activeMembersCount,
  resolvedComplaintsCount,
  socialWorksCount,
  eventsCount,
  statsLoading = false,
}) => {
  const { villageSettings, t, lang } = useApp();
  const isEn = lang === 'en';

  const villageName = isEn
    ? (villageSettings.name || 'Rasoolpur')
    : (villageSettings.nameHindi || 'रसूलपुर');

  const panchayatName = isEn
    ? (villageSettings.gramPanchayat || (villageSettings as any).panchayat || 'Bahera')
    : (villageSettings.gramPanchayatHindi || (villageSettings as any).panchayatHindi || 'बहेरा');

  const stats = [
    {
      value: activeMembersCount,
      label: t("nav.members"),
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      value: resolvedComplaintsCount,
      label: t("common.resolved"),
      icon: CheckCircle2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      value: socialWorksCount,
      label: t("nav.socialWork"),
      icon: HeartHandshake,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      value: eventsCount,
      label: t("nav.events"),
      icon: Calendar,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <section className="relative overflow-hidden w-full flex flex-col justify-center items-center text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/30 dark:border-slate-800/80 bg-[#0B130E] dark:bg-[#070B12]">
      {/* ── FULL COVER VILLAGE BACKGROUND IMAGE WITH LAYERED DEPTH ── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/village_hero.jpg"
          alt="ग्राम रसूलपुर — भारतीय गांव का विहंगम दृश्य"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Layer 1: Ambient deep vignette backdrop */}
        <div className="absolute inset-0 bg-[#0A140E]/85 dark:bg-[#060B14]/90 backdrop-blur-[0.5px]" />

        {/* Layer 2: Smooth top & bottom ambient blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0B130E] dark:to-[#090E17]" />

        {/* Layer 3: Vibrant radial highlights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── HERO CONTENT (Centered & Refined) ── */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
        {/* Village Badge with Soft Glow */}
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <VillageBadge
            village={`${t("header.village")} ${villageName}`}
            gramPanchayat={`${t("header.gramPanchayat")} ${panchayatName}`}
            variant="dark"
            pulse={true}
          />
        </div>

        {/* Hero Title & Description */}
        <div className="max-w-2xl space-y-3.5 mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.2] drop-shadow-md">
            {t("hero.title")}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 dark:text-slate-300 leading-relaxed font-medium max-w-xl mx-auto drop-shadow-sm">
            {t("hero.description")}
          </p>
        </div>

        {/* Modern Live Statistics Grid in Glassmorphic Container */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 p-2 sm:p-3 bg-white/5 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/15 dark:border-white/10 shadow-2xl">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-white/10 transition-all duration-300 group"
              >
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-lg sm:text-xl font-black text-white leading-none tracking-tight drop-shadow">
                    {statsLoading ? (
                      <Skeleton className="h-4 w-6 bg-white/15" />
                    ) : (
                      stat.value || "0"
                    )}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 dark:text-slate-400 truncate block mt-1">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modern CTA Action Buttons */}
        <div className="w-full mx-auto flex flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 pt-2">
          {/* If Logged In: Show "Add Member" button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onAddMemberClick}
              className="group relative flex-1 min-w-0 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 border border-emerald-400/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="truncate">{isEn ? 'Add Member' : 'सदस्य जोड़ें'}</span>
              <Send className="hidden sm:block w-3.5 h-3.5 transition-transform group-hover:translate-x-1 opacity-90" />
            </button>
          ) : (
            /* If Not Logged In: Show "Join Organization" button linking directly to /auth/signup */
            <Link
              href="/auth/signup"
              className="group relative flex-1 min-w-0 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-amber-600/30 hover:shadow-amber-500/50 border border-amber-400/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="truncate">{isEn ? 'Join Organization' : 'संगठन से जुड़ें'}</span>
              <ArrowRight className="hidden sm:block w-3.5 h-3.5 transition-transform group-hover:translate-x-1 opacity-90" />
            </Link>
          )}

          {/* Secondary View Members Button */}
          <Link
            href="/members"
            className="group flex-1 min-w-0 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/25 hover:border-emerald-400/50 backdrop-blur-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
          >
            <Users className="w-4 h-4 flex-shrink-0 text-emerald-400 transition-transform group-hover:scale-110" />
            <span className="truncate">{isEn ? 'View Members' : 'सदस्य निर्देशिका'}</span>
            <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-stone-300 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

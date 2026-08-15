"use client";

import React from "react";
import { Users, CreditCard, MessageCircle, Plus } from "lucide-react";
import { Button } from "../../ui";
import { useApp } from "../../../context/AppContext";

interface MemberHeaderBannerProps {
  activeMembersCount: number;
  onOpenIdCard: () => void;
  onOpenChat: () => void;
  onOpenAddMember?: () => void;
  isAdminLoggedIn: boolean;
}

export const MemberHeaderBanner: React.FC<MemberHeaderBannerProps> = ({
  activeMembersCount,
  onOpenIdCard,
  onOpenChat,
  onOpenAddMember,
  isAdminLoggedIn,
}) => {
  const { t } = useApp();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#142820] via-[#1E3A2F] to-[#2D5545] dark:from-[#0B1220] dark:via-[#111A2E] dark:to-[#172540] p-4 sm:p-6 lg:p-8 text-white border border-emerald-800/40 dark:border-slate-800 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 sm:w-64 h-48 sm:h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="h-full relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Left Side: Header info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 text-emerald-300 text-[11px] sm:text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{t("members.directoryBadge")}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5 sm:gap-3">
            <span>{t("nav.members")}</span>
            <span className="px-2 sm:px-2.5 py-0.5 text-xs sm:text-sm font-extrabold rounded-xl bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
              {t("members.countBadge", { count: activeMembersCount })}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/80 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
            {t("members.heroDescription")}
          </p>
        </div>

        {/* Right Side: Responsive Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:justify-end flex-wrap gap-2 sm:gap-2.5 z-10 pt-2 lg:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenIdCard}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40 hover:border-amber-400 backdrop-blur-md shadow-md py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer justify-center"
          >
            <CreditCard className="w-4 h-4 mr-1.5 text-amber-300" />
            <span>{t("members.digitalIdBtn")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenChat}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-400/40 hover:border-blue-400 backdrop-blur-md shadow-md py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-1.5 text-blue-300" />
            <span>{t("members.chatForumBtn")}</span>
          </Button>
          {isAdminLoggedIn && onOpenAddMember && (
            <Button
              variant="amber"
              size="sm"
              onClick={onOpenAddMember}
              className="shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 border border-amber-300/50 py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>{t("members.addNewMemberBtn")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

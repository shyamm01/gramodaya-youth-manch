"use client";

import React from "react";
import {
  Phone,
  MessageSquare,
  CreditCard,
  MessageCircle,
  Calendar,
  Building2,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Badge } from "../../ui";
import { VerifiedBadge, WhatsAppIcon } from "../../common";
import { Member } from "../../../types";
import { useApp } from "../../../context/AppContext";

interface MemberCardProps {
  member: Member;
  onSelectIdCard: (member: Member) => void;
  onSelectChat: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onSelectIdCard,
  onSelectChat,
}) => {
  const { t, lang, villageSettings } = useApp();
  const hasMobile =
    member.mobile && member.mobile !== "Information not available";
  const cleanDigits = hasMobile
    ? member.mobile.replace(/\D/g, "").slice(-10)
    : "";

  const waGreeting =
    lang === "en"
      ? `Hello ${member.name}! Contacting from Gramodaya Youth Manch:`
      : `जय हिंद ${member.name} जी! ग्रामोदय यूथ मंच रसूलपुर से संपर्क:`;

  const callUrl = hasMobile ? `tel:+91${cleanDigits}` : "#";
  const waUrl = hasMobile
    ? `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(waGreeting)}`
    : "#";

  const memberOrg =
    member.organizationName ||
    (lang === "en" ? villageSettings.orgName : villageSettings.orgNameHindi);
  const formattedDate = member.createdAt
    ? member.createdAt.slice(0, 7)
    : "2026-08";

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/80 dark:bg-[#111726]/80 backdrop-blur-md border border-[#E0DCCF]/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 dark:hover:shadow-emerald-500/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4 p-4 sm:p-5">
      {/* Top subtle ambient highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

      <div className="flex flex-col justify-between items-start gap-4 w-full">
        {/* Profile Header */}
        <div className="flex items-center justify-start gap-3.5 relative z-10 w-full">
          <div className="relative flex-shrink-0">
            <Avatar
              size="lg"
              className="w-14 h-14 ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 group-hover:ring-emerald-500/70 transition-all shadow-xs"
            >
              {member.photoUrl ? (
                <AvatarImage src={member.photoUrl} alt={member.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-[#0c1f17] text-emerald-800 dark:text-emerald-300 font-black text-base">
                {member.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-[#2C3327] dark:text-white text-sm sm:text-base truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                {member.name}
              </h3>
              <VerifiedBadge size="xs" label="" />
            </div>

            {/* Mobile number */}
            <p className="text-[11px] text-[#636054] dark:text-slate-300 font-mono mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {hasMobile ? `+91 ${cleanDigits}` : t("members.noPhone")}
              </span>
            </p>
          </div>
        </div>

        {/* Info Grid Pills */}
        <div className="grid grid-cols-2 gap-1.5 py-2.5 px-3 bg-[#F8F6F0]/80 dark:bg-[#0B0F17]/60 backdrop-blur-xs rounded-xl border border-[#E0DCCF]/60 dark:border-slate-800/80 text-[10px] text-[#636054] dark:text-slate-300 w-full">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {t("members.joinedDate", { date: formattedDate })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {member.address ||
                (lang === "en"
                  ? villageSettings.name || "Rasoolpur"
                  : villageSettings.nameHindi)}
            </span>
          </div>
        </div>

        {/* ID Card & Private Chat Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => onSelectIdCard(member)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-400/30 dark:border-amber-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("common.idCard")}</span>
          </button>
          <button
            onClick={() => onSelectChat(member)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 text-blue-900 dark:text-blue-300 border border-blue-400/30 dark:border-blue-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("common.message")}</span>
          </button>
        </div>
      </div>

      {/* Direct Call & WhatsApp Footer */}
      <div className="pt-3 border-t border-[#E0DCCF]/70 dark:border-slate-800 flex items-center gap-2">
        {hasMobile && cleanDigits ? (
          <>
            <a
              href={callUrl}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-transform duration-200 active:scale-95 cursor-pointer shadow-2xs"
              title={`${t("common.call")}: ${member.mobile}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t("common.call")}</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-transform duration-200 active:scale-95 cursor-pointer shadow-2xs"
              title={`${t("common.whatsapp")}: ${member.mobile}`}
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t("common.whatsapp")}</span>
            </a>
          </>
        ) : (
          <div className="w-full py-2 bg-[#F7F5F0] dark:bg-[#0B0F17] rounded-xl text-[11px] font-bold text-[#8C8675] dark:text-slate-400 text-center border border-[#E0DCCF]/60 dark:border-slate-800">
            <span>{t("members.noPhone")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

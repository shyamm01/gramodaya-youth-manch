'use client';

import React from 'react';
import { MapPin, Clock, ArrowRight, ImageIcon, UserCheck, Building2 } from 'lucide-react';
import { StatusBadge } from '../../common/EntityLabels';
import { GrievancePriorityBadge } from './GrievancePriorityBadge';
import { getCategoryLabel } from './GrievanceCategoryFilter';
import { Card, Badge } from '../../ui';
import { Complaint, ComplaintPriority } from '../../../types';

/** Category accent colors for top indicator bar */
const CATEGORY_ACCENT: Record<string, string> = {
  Water: 'bg-cyan-500',
  Road: 'bg-amber-600',
  Electricity: 'bg-yellow-500',
  Cleanliness: 'bg-lime-500',
  Environment: 'bg-emerald-500',
  Education: 'bg-blue-500',
  Health: 'bg-rose-500',
  Sanitation: 'bg-teal-500',
  'Animal-related': 'bg-orange-500',
  'Social Issue': 'bg-purple-500',
  'Government Service': 'bg-indigo-500',
  Other: 'bg-slate-400',
};

interface GrievanceCardProps {
  complaint: Complaint | any;
  isAdmin: boolean;
  isMemberOwner: boolean;
  lang: string;
  t: (key: string, opts?: any) => string;
  onSelect: (complaint: Complaint) => void;
  index?: number;
}

/** Relative time formatter */
function timeAgo(dateStr: string, lang: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (lang === 'en') {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  if (diffMins < 1) return 'अभी';
  if (diffMins < 60) return `${diffMins} मिनट पहले`;
  if (diffHours < 24) return `${diffHours} घंटे पहले`;
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  return new Date(dateStr).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
}

export const GrievanceCard: React.FC<GrievanceCardProps> = ({
  complaint: c,
  isAdmin,
  isMemberOwner,
  lang,
  t,
  onSelect,
  index = 0,
}) => {
  const accentColor = CATEGORY_ACCENT[c.category] || 'bg-emerald-500';
  const priority: ComplaintPriority = c.priority || 'medium';
  const primaryPhoto = c.attachments?.[0]?.url || c.photoUrl;

  const displayTitle = lang === 'hi' ? (c.titleHindi || c.title) : (c.title || c.titleHindi);
  const displayDesc = lang === 'hi' ? (c.descriptionHindi || c.description) : (c.description || c.descriptionHindi);
  const displayLocation = lang === 'hi' ? (c.locationHindi || c.location) : (c.location || c.locationHindi);
  const displayWard = lang === 'hi' ? (c.wardHindi || c.ward) : (c.ward || c.wardHindi);

  const villageName = lang === 'en'
    ? (c.villageName || c.village?.name || 'Rasoolpur')
    : (c.villageNameHindi || c.village?.nameHindi || 'रसूलपुर');

  return (
    <Card
      onClick={() => onSelect(c)}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        border border-slate-200/90 dark:border-slate-800/90
        bg-white/95 dark:bg-[#111726]/90 backdrop-blur-sm
        p-4 sm:p-5 flex flex-col justify-between
        shadow-xs hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30
        hover:-translate-y-1 hover:border-emerald-500/40 dark:hover:border-emerald-500/40
        transition-all duration-300 ease-out
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top Category Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div>
        {/* Top Badges Bar */}
        <div className="flex items-start justify-between gap-2 mb-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-900 dark:bg-black text-amber-300 dark:text-emerald-300 border border-slate-700 dark:border-slate-800 shadow-xs">
              #{c.id}
            </span>
            <Badge variant="secondary" className="text-[10px] rounded-md font-bold">
              {getCategoryLabel(c.category, lang)}
            </Badge>
            <GrievancePriorityBadge priority={priority} lang={lang} size="xs" />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <StatusBadge status={c.status} size="xs" lang={lang} />
          </div>
        </div>

        {/* Village Chip */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
            <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{villageName}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-[#2C3327] dark:text-white text-sm sm:text-base mb-2 leading-snug line-clamp-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
          {displayTitle}
        </h3>

        {/* Short Description Preview */}
        <p className="text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {displayDesc}
        </p>

        {/* Optional Thumbnail if photo is attached */}
        {primaryPhoto && (
          <div className="mb-3 h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
            <img
              src={primaryPhoto}
              alt={lang === 'en' ? 'Grievance preview' : 'शिकायत फोटो'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] text-white font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {lang === 'en' ? 'View Photo' : 'फ़ोटो देखें'}
              </span>
            </div>
            {(c.attachments?.length || 0) > 1 && (
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                +{c.attachments.length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Location, Time & CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
        <div className="flex items-center justify-between text-xs text-[#8C8675] dark:text-slate-400 mb-2.5">
          <span className="flex items-center gap-1 font-semibold text-[#2C3327] dark:text-slate-300 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {displayLocation}
              {displayWard ? `, ${displayWard}` : ''}
            </span>
          </span>
          {c.createdAt && (
            <span className="flex items-center gap-1 text-[10px] text-[#8C8675] dark:text-slate-500 font-medium flex-shrink-0 font-mono">
              <Clock className="w-3 h-3" />
              {timeAgo(c.createdAt, lang)}
            </span>
          )}
        </div>

        {/* Bottom bar with Author badge & View Details CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {isMemberOwner && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md">
                <UserCheck className="w-3 h-3" />
                {lang === 'en' ? 'Your Post' : 'आपकी प्रविष्टि'}
              </span>
            )}
          </div>

          <button
            type="button"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 flex items-center gap-1 ml-auto cursor-pointer"
          >
            <span>{lang === 'en' ? 'View Details' : 'विवरण देखें'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </Card>
  );
};

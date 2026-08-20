'use client';

import React from 'react';
import Link from 'next/link';
import {
  Volume2,
  HeartHandshake,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../ui';
import { PublicInfo, SocialWork, EventItem, GalleryItem, Announcement } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface HomeActivityFeedsProps {
  announcements?: Announcement[] | any[];
  announcementsLoading?: boolean;
  approvedInfos?: PublicInfo[];
  approvedSocialWorks: SocialWork[] | any[];
  socialWorkLoading?: boolean;
  publishedEvents: EventItem[] | any[];
  eventsLoading?: boolean;
  approvedGalleryPhotos: GalleryItem[] | any[];
  galleryLoading?: boolean;
}

/** How many items each feed previews before the user has to tap "All". */
const FEED_LIMIT = 5;

/**
 * One rail item's width: a fixed card that scrolls on narrow screens, and from
 * `lg` up exactly a fifth of the rail (minus the four 0.625rem gaps) so all
 * FEED_LIMIT items fit across the full-width section without scrolling.
 */
const RAIL_ITEM_WIDTH = 'w-[190px] sm:w-[210px] lg:w-[calc((100%_-_2.5rem)/5)]';

/**
 * Horizontal, snap-scrolling rail. The negative margins let cards bleed to the
 * edge of the parent Card's padding so a partially visible card hints that the
 * rail scrolls.
 */
const FeedRail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory -mx-4 sm:-mx-5 px-4 sm:px-5 pb-2 -mb-2">
    {children}
  </div>
);

/** Shared look for one item card inside a rail. */
const RAIL_CARD =
  `snap-start shrink-0 ${RAIL_ITEM_WIDTH} flex flex-col p-3 bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] rounded-xl border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors`;

const RailSkeleton: React.FC = () => (
  <FeedRail>
    {[0, 1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className={`shrink-0 ${RAIL_ITEM_WIDTH} h-24 rounded-xl`} />
    ))}
  </FeedRail>
);

const EmptyFeed: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="text-center py-8 px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
    <Icon className="w-6 h-6 mx-auto text-[#A59F8E] dark:text-slate-600 mb-1.5 opacity-60" />
    <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">{label}</p>
  </div>
);

export const HomeActivityFeeds: React.FC<HomeActivityFeedsProps> = ({
  announcements = [],
  announcementsLoading = false,
  approvedInfos = [],
  approvedSocialWorks = [],
  socialWorkLoading = false,
  publishedEvents = [],
  eventsLoading = false,
  approvedGalleryPhotos = [],
  galleryLoading = false,
}) => {
  const { t, lang } = useApp();

  const notices = announcements.length > 0 ? announcements : approvedInfos;
  const locale = lang === 'en' ? 'en-IN' : 'hi-IN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
      {/* ── FULL-WIDTH ACTIVITY SECTIONS, one per feed ── */}
      <div className="space-y-4 sm:space-y-5">

        {/* 1. PUBLIC NOTICES (सूचनाएं) */}
        <Card className="min-w-0 overflow-hidden p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.announcements')}
                  </h3>
                  <span className="block text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-1">
                    {t('home.noticesSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/announcements"
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex-shrink-0"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {announcementsLoading ? (
              <RailSkeleton />
            ) : notices.length === 0 ? (
              <EmptyFeed icon={Volume2} label={t('home.noNotices')} />
            ) : (
              <FeedRail>
                {notices.slice(0, FEED_LIMIT).map((item: any) => (
                  <div key={item.id} className={RAIL_CARD}>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      {item.isUrgent ? (
                        <Badge
                          variant="destructive"
                          className="gap-0.5 text-[9px] px-1.5 py-0 uppercase tracking-wider bg-red-500 text-white border-transparent flex-shrink-0"
                        >
                          <AlertCircle className="w-2.5 h-2.5" />
                          {t('common.urgent')}
                        </Badge>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 flex-shrink-0" />
                      )}
                      {(item.date || item.createdAt) && (
                        <span className="text-[9px] text-[#8C8675] dark:text-slate-500 font-mono flex-shrink-0">
                          {new Date(item.date || item.createdAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 line-clamp-2 leading-snug">
                      {item.title || item.name}
                    </h4>
                    <p className="text-[11px] text-[#6B6554] dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                      {item.content || item.information || item.description}
                    </p>
                  </div>
                ))}
              </FeedRail>
            )}
          </div>
        </Card>

        {/* 2. SOCIAL WORK (सामाजिक कार्य) */}
        <Card className="min-w-0 overflow-hidden p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.socialWork')}
                  </h3>
                  <span className="block text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-1">
                    {t('home.socialWorkSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/social-work"
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex-shrink-0"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {socialWorkLoading ? (
              <RailSkeleton />
            ) : approvedSocialWorks.length === 0 ? (
              <EmptyFeed icon={HeartHandshake} label={t('home.noSocialWork')} />
            ) : (
              <FeedRail>
                {approvedSocialWorks.slice(0, FEED_LIMIT).map((sw: any) => (
                  <div key={sw.id} className={RAIL_CARD}>
                    <h4 className="text-xs font-bold text-[#2C3327] dark:text-white line-clamp-2 leading-snug">
                      {sw.title}
                    </h4>
                    {sw.location && (
                      <span className="text-[10px] text-[#8C8675] dark:text-slate-400 flex items-center gap-0.5 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{sw.location}</span>
                      </span>
                    )}
                    <p className="text-[11px] text-[#6B6554] dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                      {sw.description}
                    </p>
                  </div>
                ))}
              </FeedRail>
            )}
          </div>
        </Card>

        {/* 3. UPCOMING EVENTS (ग्राम कार्यक्रम) */}
        <Card className="min-w-0 overflow-hidden p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.events')}
                  </h3>
                  <span className="block text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-1">
                    {t('home.eventsSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/events"
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex-shrink-0"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {eventsLoading ? (
              <RailSkeleton />
            ) : publishedEvents.length === 0 ? (
              <EmptyFeed icon={Calendar} label={t('home.noEvents')} />
            ) : (
              <FeedRail>
                {publishedEvents.slice(0, FEED_LIMIT).map((ev: any) => (
                  <div key={ev.id} className={RAIL_CARD}>
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-md self-start mb-1.5">
                      {ev.date}
                    </span>
                    <h4 className="text-xs font-bold text-[#2C3327] dark:text-white line-clamp-2 leading-snug">
                      {ev.title || ev.name}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] text-[#8C8675] dark:text-slate-400">
                      {ev.time && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </FeedRail>
            )}
          </div>
        </Card>

        {/* 4. PHOTO GALLERY (चित्रशाला) */}
        <Card className="min-w-0 overflow-hidden p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.gallery')}
                  </h3>
                  <span className="block text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-1">
                    {t('home.gallerySubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/gallery"
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex-shrink-0"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {galleryLoading ? (
              <FeedRail>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className={`shrink-0 ${RAIL_ITEM_WIDTH} aspect-[4/3] rounded-xl`} />
                ))}
              </FeedRail>
            ) : approvedGalleryPhotos.length === 0 ? (
              <EmptyFeed icon={ImageIcon} label={t('home.noGallery')} />
            ) : (
              <FeedRail>
                {approvedGalleryPhotos.slice(0, FEED_LIMIT).map((photo: any) => (
                  <div
                    key={photo.id}
                    className={`snap-start shrink-0 ${RAIL_ITEM_WIDTH} aspect-[4/3] relative rounded-xl overflow-hidden group/img bg-[#F0ECE1] dark:bg-slate-900 border border-[#E0DCCF]/80 dark:border-slate-800`}
                  >
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || 'ग्राम चित्र'}
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                    />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[9px] text-white truncate text-center">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </FeedRail>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

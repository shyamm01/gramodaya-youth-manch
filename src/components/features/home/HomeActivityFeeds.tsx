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
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge } from '../../ui';
import { PublicInfo, SocialWork, EventItem, GalleryItem, Announcement } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface HomeActivityFeedsProps {
  announcements?: Announcement[] | any[];
  approvedInfos?: PublicInfo[];
  approvedSocialWorks: SocialWork[] | any[];
  publishedEvents: EventItem[] | any[];
  approvedGalleryPhotos: GalleryItem[] | any[];
}

export const HomeActivityFeeds: React.FC<HomeActivityFeedsProps> = ({
  announcements = [],
  approvedInfos = [],
  approvedSocialWorks = [],
  publishedEvents = [],
  approvedGalleryPhotos = [],
}) => {
  const { t } = useApp();

  const notices = announcements.length > 0 ? announcements : approvedInfos;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
      {/* ── 2x2 MODERN ACTIVITY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* 1. PUBLIC NOTICES (सूचनाएं) */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.announcements')}
                  </h3>
                  <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                    {t('home.noticesSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/announcements"
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {notices.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
                <Volume2 className="w-6 h-6 mx-auto text-[#A59F8E] dark:text-slate-600 mb-1.5 opacity-60" />
                <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
                  {t('home.noNotices')}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notices.slice(0, 2).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] rounded-xl border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate max-w-[75%]">
                        {item.isUrgent && (
                          <span className="flex items-center gap-0.5 text-[9px] font-extrabold bg-red-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            <AlertCircle className="w-2.5 h-2.5" />
                            अति-आवश्यक
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/80 px-2 py-0.5 rounded-md truncate">
                          {item.title || item.name}
                        </span>
                      </div>
                      {(item.date || item.createdAt) && (
                        <span className="text-[9px] text-[#8C8675] dark:text-slate-500 font-mono flex-shrink-0">
                          {new Date(item.date || item.createdAt).toLocaleDateString(
                            t('common.village') === 'Village' ? 'en-IN' : 'hi-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                            }
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2C3327] dark:text-slate-200 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {item.content || item.information || item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 2. SOCIAL WORK (सामाजिक कार्य) */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.socialWork')}
                  </h3>
                  <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                    {t('home.socialWorkSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/social-work"
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {approvedSocialWorks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
                <HeartHandshake className="w-6 h-6 mx-auto text-[#A59F8E] dark:text-slate-600 mb-1.5 opacity-60" />
                <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
                  {t('home.noSocialWork')}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {approvedSocialWorks.slice(0, 2).map((sw: any) => (
                  <div
                    key={sw.id}
                    className="p-3 bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] rounded-xl border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#2C3327] dark:text-white truncate">
                        {sw.title}
                      </h4>
                      {sw.location && (
                        <span className="text-[10px] text-[#8C8675] dark:text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                          <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          {sw.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2C3327] dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {sw.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 3. UPCOMING EVENTS (ग्राम कार्यक्रम) */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.events')}
                  </h3>
                  <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                    {t('home.eventsSubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/events"
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {publishedEvents.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
                <Calendar className="w-6 h-6 mx-auto text-[#A59F8E] dark:text-slate-600 mb-1.5 opacity-60" />
                <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
                  {t('home.noEvents')}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {publishedEvents.slice(0, 2).map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] rounded-xl border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#2C3327] dark:text-white truncate">
                        {ev.title || ev.name}
                      </h4>
                      <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-md flex-shrink-0">
                        {ev.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#8C8675] dark:text-slate-400">
                      {ev.time && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                          {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 4. PHOTO GALLERY (चित्रशाला) */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                    {t('nav.gallery')}
                  </h3>
                  <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                    {t('home.gallerySubtitle')}
                  </span>
                </div>
              </div>

              <Link
                href="/gallery"
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              >
                <span>{t('common.all')}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {approvedGalleryPhotos.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
                <ImageIcon className="w-6 h-6 mx-auto text-[#A59F8E] dark:text-slate-600 mb-1.5 opacity-60" />
                <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
                  {t('home.noPhotos')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {approvedGalleryPhotos.slice(0, 3).map((photo: any) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden group/img bg-[#F0ECE1] dark:bg-slate-900 border border-[#E0DCCF]/80 dark:border-slate-800"
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
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

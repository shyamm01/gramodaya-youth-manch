'use client';

import React, { useState } from 'react';
import { Sprout, Users, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';
import {
  Button,
  Card,
} from '../ui';

export const AboutSection: React.FC = () => {
  const { villageSettings: contextVillageSettings, t, lang } = useApp();
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const inFlightAboutPromiseRef = React.useRef<Promise<any> | null>(null);

  // Dedicated API Fetch: GET /api/about (deduplicated)
  const fetchAbout = React.useCallback(async () => {
    if (inFlightAboutPromiseRef.current) {
      return inFlightAboutPromiseRef.current;
    }
    const promise = (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/about', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.village) {
            setAboutData(data);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/about:', e);
      } finally {
        setLoading(false);
        inFlightAboutPromiseRef.current = null;
      }
    })();
    inFlightAboutPromiseRef.current = promise;
    return promise;
  }, []);

  React.useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const villageSettings = aboutData?.village || contextVillageSettings;

  return (
    <div className="py-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6 transition-colors duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#18281E] via-[#24382B] to-[#1B3025] dark:from-[#0B1528] dark:via-[#0C1E19] dark:to-[#080C14] text-white rounded-3xl p-6 sm:p-10 border border-[#3B4F3D] dark:border-slate-800 shadow-md text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/30">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span>{t('about.badge')}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white">
          {lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi}
        </h1>

        <p className="text-xs sm:text-sm text-emerald-200/80">
          {t('header.village')} — <span className="font-bold text-white">{lang === 'en' ? villageSettings.name : villageSettings.nameHindi}</span> | {t('header.gramPanchayat')} — <span className="font-bold text-white">{lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi}</span>
        </p>

        <p className="text-sm sm:text-lg font-bold text-amber-300/90 italic">
          “{lang === 'en' ? (villageSettings.slogan || villageSettings.tagline) : villageSettings.sloganHindi}”
        </p>
      </div>

      {/* Purpose & Mission Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="text-base sm:text-lg font-black text-[#2C3327] dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('about.purposeTitle')}</span>
        </h2>

        <p className="text-xs sm:text-sm text-[#2C3327] dark:text-slate-200 leading-relaxed font-medium bg-[#F7F5F0] dark:bg-[#0B0F17] p-5 rounded-2xl border border-[#E0DCCF] dark:border-slate-800">
          {lang === 'en' ? (villageSettings.orgPurposeHindi ? t('hero.description') : villageSettings.orgPurposeHindi) : villageSettings.orgPurposeHindi}
        </p>
      </Card>

      {/* Key Objectives Grid */}
      <Card className="p-6 sm:p-8 space-y-5">
        <h2 className="text-base sm:text-lg font-black text-[#2C3327] dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span>{t('about.prioritiesTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#F7F5F0] dark:bg-[#0B0F17] p-4 rounded-2xl border border-[#E0DCCF] dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#2C3327] dark:text-white mb-1">
              {t('about.p1Title')}
            </h3>
            <p className="text-[11px] text-[#8C8675] dark:text-slate-400">
              {t('about.p1Desc')}
            </p>
          </div>

          <div className="bg-[#F7F5F0] dark:bg-[#0B0F17] p-4 rounded-2xl border border-[#E0DCCF] dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#2C3327] dark:text-white mb-1">
              {t('about.p2Title')}
            </h3>
            <p className="text-[11px] text-[#8C8675] dark:text-slate-400">
              {t('about.p2Desc')}
            </p>
          </div>

          <div className="bg-[#F7F5F0] dark:bg-[#0B0F17] p-4 rounded-2xl border border-[#E0DCCF] dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#2C3327] dark:text-white mb-1">
              {t('about.p3Title')}
            </h3>
            <p className="text-[11px] text-[#8C8675] dark:text-slate-400">
              {t('about.p3Desc')}
            </p>
          </div>

          <div className="bg-[#F7F5F0] dark:bg-[#0B0F17] p-4 rounded-2xl border border-[#E0DCCF] dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#2C3327] dark:text-white mb-1">
              {t('about.p4Title')}
            </h3>
            <p className="text-[11px] text-[#8C8675] dark:text-slate-400">
              {t('about.p4Desc')}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link href="/members">
          <Button variant="default" size="default" className="px-5 py-2.5 rounded-xl font-bold cursor-pointer">
            <Users className="w-4 h-4 mr-1.5" />
            <span>{t('nav.members')}</span>
          </Button>
        </Link>

        <Link href="/leadership">
          <Button variant="outline" size="default" className="px-5 py-2.5 rounded-xl font-bold cursor-pointer">
            <span>{t('nav.leadership')}</span>
            <ArrowRight className="w-4 h-4 ml-1.5 text-emerald-600 dark:text-emerald-400" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

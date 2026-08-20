'use client';

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Eye,
  Target,
  Building2,
  HandHeart,
  Landmark,
  Briefcase,
  GraduationCap,
  Laptop,
  Compass,
  Award,
  Wrench,
  Stethoscope,
  Trash2,
  Recycle,
  Droplet,
  HeartPulse,
  Leaf,
  TreePine,
  Droplets,
  Ban,
  Sprout,
  Users,
  Star,
  Trophy,
  HeartHandshake,
  Heart,
  LifeBuoy,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';

export const CATEGORIES = [
  {
    slug: 'rural-development',
    headingKey: 'visionMission.cat.ruralDevelopment',
    icon: Building2,
    items: [
      { titleKey: 'visionMission.infrastructure.title', descKey: 'visionMission.infrastructure.desc', icon: Building2 },
      { titleKey: 'visionMission.localInitiatives.title', descKey: 'visionMission.localInitiatives.desc', icon: HandHeart },
      { titleKey: 'visionMission.govtSchemesLink.title', descKey: 'visionMission.govtSchemesLink.desc', icon: Landmark },
      { titleKey: 'visionMission.entrepreneurship.title', descKey: 'visionMission.entrepreneurship.desc', icon: Briefcase },
    ],
  },
  {
    slug: 'education',
    headingKey: 'visionMission.cat.education',
    icon: GraduationCap,
    items: [
      { titleKey: 'visionMission.weakerFamilies.title', descKey: 'visionMission.weakerFamilies.desc', icon: HeartHandshake },
      { titleKey: 'visionMission.digitalLiteracy.title', descKey: 'visionMission.digitalLiteracy.desc', icon: Laptop },
      { titleKey: 'visionMission.careerGuidanceYouth.title', descKey: 'visionMission.careerGuidanceYouth.desc', icon: Compass },
      { titleKey: 'visionMission.scholarshipsSupport.title', descKey: 'visionMission.scholarshipsSupport.desc', icon: Award },
      { titleKey: 'visionMission.skillDevEducation.title', descKey: 'visionMission.skillDevEducation.desc', icon: Wrench },
    ],
  },
  {
    slug: 'sanitation-health',
    headingKey: 'visionMission.cat.sanitationHealth',
    icon: Stethoscope,
    items: [
      { titleKey: 'visionMission.cleanlinessDrives.title', descKey: 'visionMission.cleanlinessDrives.desc', icon: Trash2 },
      { titleKey: 'visionMission.wasteManagement.title', descKey: 'visionMission.wasteManagement.desc', icon: Recycle },
      { titleKey: 'visionMission.sanitationAwareness.title', descKey: 'visionMission.sanitationAwareness.desc', icon: Droplet },
      { titleKey: 'visionMission.healthCamps.title', descKey: 'visionMission.healthCamps.desc', icon: Stethoscope },
      { titleKey: 'visionMission.menstrualHygiene.title', descKey: 'visionMission.menstrualHygiene.desc', icon: HeartPulse },
    ],
  },
  {
    slug: 'environment',
    headingKey: 'visionMission.cat.environment',
    icon: Leaf,
    items: [
      { titleKey: 'visionMission.treePlantation.title', descKey: 'visionMission.treePlantation.desc', icon: TreePine },
      { titleKey: 'visionMission.waterConservation.title', descKey: 'visionMission.waterConservation.desc', icon: Droplets },
      { titleKey: 'visionMission.villageCleanliness.title', descKey: 'visionMission.villageCleanliness.desc', icon: Leaf },
      { titleKey: 'visionMission.plasticReduction.title', descKey: 'visionMission.plasticReduction.desc', icon: Ban },
      { titleKey: 'visionMission.sustainableAgri.title', descKey: 'visionMission.sustainableAgri.desc', icon: Sprout },
    ],
  },
  {
    slug: 'youth-development',
    headingKey: 'visionMission.cat.youthDevelopment',
    icon: Sparkles,
    items: [
      { titleKey: 'visionMission.volunteerNetwork.title', descKey: 'visionMission.volunteerNetwork.desc', icon: Users },
      { titleKey: 'visionMission.leadershipDev.title', descKey: 'visionMission.leadershipDev.desc', icon: Star },
      { titleKey: 'visionMission.sportsCulture.title', descKey: 'visionMission.sportsCulture.desc', icon: Trophy },
      { titleKey: 'visionMission.skillDevYouth.title', descKey: 'visionMission.skillDevYouth.desc', icon: Wrench },
      { titleKey: 'visionMission.youthProjects.title', descKey: 'visionMission.youthProjects.desc', icon: Sparkles },
    ],
  },
  {
    slug: 'social-welfare',
    headingKey: 'visionMission.cat.socialWelfare',
    icon: HeartHandshake,
    items: [
      { titleKey: 'visionMission.weakerFamiliesWelfare.title', descKey: 'visionMission.weakerFamiliesWelfare.desc', icon: HandHeart },
      { titleKey: 'visionMission.elderlySupport.title', descKey: 'visionMission.elderlySupport.desc', icon: Heart },
      { titleKey: 'visionMission.emergencySupport.title', descKey: 'visionMission.emergencySupport.desc', icon: LifeBuoy },
      { titleKey: 'visionMission.schemeAwareness.title', descKey: 'visionMission.schemeAwareness.desc', icon: FileText },
      { titleKey: 'visionMission.welfareInitiatives.title', descKey: 'visionMission.welfareInitiatives.desc', icon: HeartHandshake },
    ],
  },
];

const INITIAL_VISIBLE = 4;

export const VisionMissionSection: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="relative w-full flex flex-col items-start justify-start mb-6">
        <div className="relative w-full flex items-start justify-start">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
            <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="w-full flex flex-col items-start justify-start ml-4">
            <h1 className="text-2xl sm:text-4xl font-black text-[#2C3327] dark:text-white">
              {t('visionMission.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t('visionMission.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission statements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-5 sm:p-6 flex flex-col items-start gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <Eye className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white mb-1.5">
              {t('visionMission.visionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t('visionMission.visionText')}
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 flex flex-col items-start gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
            <Target className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white mb-1.5">
              {t('visionMission.missionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t('visionMission.missionText')}
            </p>
          </div>
        </Card>
      </div>

      <div className="w-full flex flex-col gap-4 items-start justify-start">
        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          const visibleItems = category.items.slice(0, INITIAL_VISIBLE);

          return (
            <section key={category.headingKey} className="w-full flex flex-col gap-3">
              <div className="w-full flex justify-between items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white flex items-center gap-2 px-1 min-w-0 leading-snug">
                  <CategoryIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t(category.headingKey)}</span>
                </h2>

                <Link
                  href={`/vision-mission/${category.slug}`}
                  className="flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                >
                  <span>{t('common.showMore')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Card
                      key={item.titleKey}
                      className="p-4 sm:p-5 flex flex-col gap-3 h-full"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                          <ItemIcon className="size-5 text-white" />
                        </div>

                        <h3 className="min-w-0 text-xs sm:text-sm font-bold text-[#2C3327] dark:text-white line-clamp-2">
                          {t(item.titleKey)}
                        </h3>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed line-clamp-2">
                        {t(item.descKey)}
                      </p>

                      <Link href="/social-work" className="w-full mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl font-bold text-[11px] cursor-pointer"
                        >
                          <span>{t('common.getInvolved')}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

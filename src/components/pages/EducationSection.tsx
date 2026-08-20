"use client";

import React from "react";
import {
  GraduationCap,
  Award,
  School,
  Laptop,
  Compass,
  FileText,
  BookOpen,
  HeartHandshake,
  Utensils,
  ShieldCheck,
  Smartphone,
  Tv,
  Wrench,
  ClipboardList,
  MessageCircle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { Card, Button } from "../ui";

/** Whose programme an item is. Items without a scope are government schemes. */
export type SchemeScope = "gramodaya" | "government";

export interface CategoryItem {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  /** Omit for government schemes; set to "gramodaya" for the Manch's own. */
  scope?: SchemeScope;
}

export interface Category {
  slug: string;
  headingKey: string;
  /** One-paragraph description shown at the top of the category page. */
  overviewKey: string;
  icon: LucideIcon;
  items: CategoryItem[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "digital",
    overviewKey: "education.cat.digital.overview",
    headingKey: "education.cat.digital",
    icon: Laptop,
    items: [
      {
        titleKey: "education.diksha.title",
        descKey: "education.diksha.desc",
        icon: Smartphone,
      },
      {
        titleKey: "education.swayam.title",
        descKey: "education.swayam.desc",
        icon: Laptop,
      },
      {
        titleKey: "education.epathshala.title",
        descKey: "education.epathshala.desc",
        icon: Tv,
      },
    ],
  },
  {
    slug: "career-guidance",
    overviewKey: "education.cat.careerGuidance.overview",
    headingKey: "education.cat.careerGuidance",
    icon: Compass,
    items: [
      {
        titleKey: "education.afterTenTwelve.title",
        descKey: "education.afterTenTwelve.desc",
        icon: Compass,
      },
      {
        titleKey: "education.itiPolytechnic.title",
        descKey: "education.itiPolytechnic.desc",
        icon: Wrench,
      },
      {
        titleKey: "education.examPrep.title",
        descKey: "education.examPrep.desc",
        icon: ClipboardList,
      },
      {
        titleKey: "education.counseling.title",
        descKey: "education.counseling.desc",
        icon: MessageCircle,
      },
    ],
  },
  {
    slug: "scholarships",
    overviewKey: "education.cat.scholarships.overview",
    headingKey: "education.cat.scholarships",
    icon: Award,
    items: [
      {
        titleKey: "education.nsp.title",
        descKey: "education.nsp.desc",
        icon: FileText,
      },
      {
        titleKey: "education.prePostMatric.title",
        descKey: "education.prePostMatric.desc",
        icon: BookOpen,
      },
      {
        titleKey: "education.betiBachao.title",
        descKey: "education.betiBachao.desc",
        icon: HeartHandshake,
      },
      {
        titleKey: "education.midDayMeal.title",
        descKey: "education.midDayMeal.desc",
        icon: Utensils,
      },
    ],
  },
  {
    slug: "institutions",
    overviewKey: "education.cat.institutions.overview",
    headingKey: "education.cat.institutions",
    icon: School,
    items: [
      {
        titleKey: "education.rte.title",
        descKey: "education.rte.desc",
        icon: ShieldCheck,
      },
      {
        titleKey: "education.samagraShiksha.title",
        descKey: "education.samagraShiksha.desc",
        icon: School,
      },
      {
        titleKey: "education.adultLiteracy.title",
        descKey: "education.adultLiteracy.desc",
        icon: BookOpen,
      },
    ],
  }
];

const INITIAL_VISIBLE = 4;

export const EducationSection: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="relative w-full flex flex-col items-start justify-start mb-6">
        <div className="relative w-full flex items-start justify-start">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
            <GraduationCap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="w-full flex flex-col items-start justify-start ml-4">
            <h1 className="text-2xl sm:text-4xl font-black text-[#2C3327] dark:text-white">
              {t("education.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t("education.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 items-start justify-start">
        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          const visibleItems = category.items.slice(0, INITIAL_VISIBLE);

          return (
            <section
              key={category.headingKey}
              className="w-full flex flex-col gap-3"
            >
              <div className="w-full flex justify-between items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white flex items-center gap-2 px-1 min-w-0 leading-snug">
                  <CategoryIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t(category.headingKey)}</span>
                </h2>

                <Link
                  href={`/education/${category.slug}`}
                  className="flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                >
                  <span>{t("common.showMore")}</span>
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

                      <Link href="/helpline" className="w-full mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl font-bold text-[11px] cursor-pointer"
                        >
                          <span>{t("common.learnMore")}</span>
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

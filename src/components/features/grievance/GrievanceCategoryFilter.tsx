'use client';

import React, { useMemo } from 'react';
import { ComplaintCategory } from '../../../types';

const CATEGORY_MAP: { id: ComplaintCategory; labelHindi: string; labelEnglish: string; icon: string }[] = [
  { id: 'Water', labelHindi: 'पानी', labelEnglish: 'Water', icon: '🚰' },
  { id: 'Road', labelHindi: 'सड़क', labelEnglish: 'Road', icon: '🛣️' },
  { id: 'Electricity', labelHindi: 'बिजली', labelEnglish: 'Electricity', icon: '💡' },
  { id: 'Cleanliness', labelHindi: 'स्वच्छता', labelEnglish: 'Cleanliness', icon: '🧹' },
  { id: 'Environment', labelHindi: 'पर्यावरण', labelEnglish: 'Environment', icon: '🌳' },
  { id: 'Education', labelHindi: 'शिक्षा', labelEnglish: 'Education', icon: '🏫' },
  { id: 'Health', labelHindi: 'स्वास्थ्य', labelEnglish: 'Health', icon: '🏥' },
  { id: 'Sanitation', labelHindi: 'शौचालय', labelEnglish: 'Sanitation', icon: '🚽' },
  { id: 'Animal-related', labelHindi: 'पशु संबंधी मुद्दा', labelEnglish: 'Animal Issue', icon: '🐄' },
  { id: 'Social Issue', labelHindi: 'सामाजिक मुद्दा', labelEnglish: 'Social Issue', icon: '👥' },
  { id: 'Government Service', labelHindi: 'सरकारी सेवा', labelEnglish: 'Govt Service', icon: '🏛️' },
  { id: 'Other', labelHindi: 'अन्य', labelEnglish: 'Other', icon: '📌' },
];

interface GrievanceCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  /** Pre-computed category counts from API, keyed by category name */
  categoryCounts?: Record<string, number>;
  /** Fallback: compute counts from complaint list if API counts not available */
  complaints?: any[];
  lang: string;
  t: (key: string, opts?: any) => string;
}

export const GrievanceCategoryFilter: React.FC<GrievanceCategoryFilterProps> = ({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  complaints = [],
  lang,
  t,
}) => {
  // Use API-provided counts or compute from local list (memoized)
  const counts = useMemo(() => {
    if (categoryCounts) return categoryCounts;
    const map: Record<string, number> = {};
    for (const c of complaints) {
      map[c.category] = (map[c.category] || 0) + 1;
    }
    return map;
  }, [categoryCounts, complaints]);

  const totalCount = useMemo(() => {
    return Object.values(counts).reduce((sum, n) => sum + n, 0);
  }, [counts]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
      {/* All button */}
      <button
        onClick={() => onCategoryChange('ALL')}
        className={`
          group relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold
          transition-all duration-200 cursor-pointer border
          ${activeCategory === 'ALL'
            ? 'bg-gradient-to-r from-[#1E3A2F] to-[#2D5545] dark:from-emerald-900 dark:to-emerald-800 text-white border-transparent shadow-lg shadow-emerald-900/20'
            : 'bg-white/60 dark:bg-slate-800/60 text-[#2C3327] dark:text-slate-300 border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 backdrop-blur-sm'
          }
        `}
      >
        <span className="text-sm">📊</span>
        <span>{t('common.all')}</span>
        <span className={`
          text-[10px] font-mono ml-0.5 px-1.5 py-0.5 rounded-md
          ${activeCategory === 'ALL'
            ? 'bg-white/20 text-white/90'
            : 'bg-[#F7F5F0] dark:bg-slate-700 text-[#8C8675] dark:text-slate-400'
          }
        `}>
          {totalCount}
        </span>
      </button>

      {/* Category buttons */}
      {CATEGORY_MAP.map((catObj) => {
        const count = counts[catObj.id] || 0;
        const label = lang === 'en' ? catObj.labelEnglish : catObj.labelHindi;
        const isActive = activeCategory === catObj.id;

        return (
          <button
            key={catObj.id}
            onClick={() => onCategoryChange(catObj.id)}
            className={`
              group relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold
              transition-all duration-200 cursor-pointer border
              ${isActive
                ? 'bg-gradient-to-r from-[#1E3A2F] to-[#2D5545] dark:from-emerald-900 dark:to-emerald-800 text-white border-transparent shadow-lg shadow-emerald-900/20'
                : 'bg-white/60 dark:bg-slate-800/60 text-[#2C3327] dark:text-slate-300 border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 backdrop-blur-sm'
              }
              ${count === 0 && !isActive ? 'opacity-50' : ''}
            `}
          >
            <span className="text-sm">{catObj.icon}</span>
            <span>{label}</span>
            {count > 0 && (
              <span className={`
                text-[10px] font-mono ml-0.5 px-1.5 py-0.5 rounded-md
                ${isActive
                  ? 'bg-white/20 text-white/90'
                  : 'bg-[#F7F5F0] dark:bg-slate-700 text-[#8C8675] dark:text-slate-400'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export function getCategoryLabel(category: string, lang: string): string {
  if (!category) return '';
  const match = CATEGORY_MAP.find(
    (c) =>
      c.id.toLowerCase() === category.toLowerCase() ||
      c.labelEnglish.toLowerCase() === category.toLowerCase() ||
      c.labelHindi === category
  );
  if (!match) return category;
  return lang === 'en' ? match.labelEnglish : match.labelHindi;
}

export { CATEGORY_MAP };

'use client';

import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Card } from '../../ui';

interface GrievanceEmptyStateProps {
  message?: string;
  lang?: string;
}

export const GrievanceEmptyState: React.FC<GrievanceEmptyStateProps> = ({
  message,
  lang = 'hi',
}) => {
  const defaultMessage = lang === 'en'
    ? 'No grievances found matching these filters'
    : 'इस फ़िल्टर के अनुसार कोई शिकायत नहीं मिली';

  return (
    <Card className="p-12 text-center rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800 bg-gradient-to-br from-[#FDFBF7] via-white to-[#F7F5F0] dark:from-[#0B0F17] dark:via-[#111726] dark:to-[#0B0F17]">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 animate-pulse" />
        <div className="relative flex items-center justify-center w-full h-full rounded-2xl">
          <AlertTriangle className="w-7 h-7 text-amber-500/70 dark:text-amber-400/60" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 dark:text-amber-500 animate-bounce" style={{ animationDuration: '2s' }} />
      </div>
      <p className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
        {defaultMessage || message}
      </p>
      <p className="text-xs text-[#8C8675] dark:text-slate-500">
        {lang === 'en' ? 'New grievances will appear here' : 'नई शिकायतें यहाँ दिखाई देंगी'}
      </p>
    </Card>
  );
};

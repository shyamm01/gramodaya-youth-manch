'use client';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
  const { lang, setLang } = useApp();

  const toggleLanguage = () => {
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
  };

  const isHindi = lang === 'hi';

  return (
    <div className="inline-flex items-center">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800/90 dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200 border border-[#D5CFBF] dark:border-slate-700 shadow-2xs active:scale-95"
        title="भाषा बदलें / Switch Language (हिन्दी / English)"
        aria-label="Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
        <span className="flex items-center gap-1">
          <span
            className={
              isHindi
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-black text-[11px]'
                : 'text-[#636054] dark:text-slate-400 hover:text-[#2C3327] font-semibold text-[11px]'
            }
          >
            हिन्दी
          </span>
          <span className="text-[#A39E93] dark:text-slate-600 font-bold">/</span>
          <span
            className={
              !isHindi
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-black text-[11px]'
                : 'text-[#636054] dark:text-slate-400 hover:text-[#2C3327] font-semibold text-[11px]'
            }
          >
            EN
          </span>
        </span>
      </button>
    </div>
  );
};

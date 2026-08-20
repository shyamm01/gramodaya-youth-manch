'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, EXTENDED_LANGUAGE_CATALOG, LanguageDef } from '../../i18n/languages';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { lang, setLang, t } = useApp();
  // `compact` is for the 32px-tall utility bar, where the default sizing is
  // taller than the bar it sits in.
  const sz = compact
    ? { pad: 'px-2 py-0.5', chevronPad: 'px-1 py-0.5', icon: 'w-3 h-3', text: 'text-[10px]' }
    : { pad: 'px-2.5 py-1', chevronPad: 'px-1.5 py-1', icon: 'w-3.5 h-3.5', text: 'text-[11px]' };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allAvailableLanguages: LanguageDef[] = [
    ...SUPPORTED_LANGUAGES,
    ...EXTENDED_LANGUAGE_CATALOG.filter(
      (ext) => !SUPPORTED_LANGUAGES.some((sup) => sup.code === ext.code)
    ),
  ];

  const currentLangObj =
    allAvailableLanguages.find((l) => l.code === lang) ||
    allAvailableLanguages[0] || {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
    };

  const handleSelectLanguage = (code: string) => {
    setLang(code);
    setIsOpen(false);
  };

  const isHindi = lang === 'hi';

  const toggleHindiEnglishQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <div className="flex items-center rounded-xl bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-[#D5CFBF] dark:border-slate-700 shadow-2xs transition-all overflow-hidden">
        {/* Quick Toggle Button (Hindi / English) */}
        <button
          onClick={toggleHindiEnglishQuick}
          className={`flex items-center gap-1.5 ${sz.pad} text-xs font-bold text-[#2C3327] dark:text-slate-200 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
          title="भाषा बदलें / Quick Switch (हिन्दी / English)"
          aria-label="Toggle Hindi English"
        >
          <Globe className={`${sz.icon} text-emerald-700 dark:text-emerald-400 flex-shrink-0`} />
          <span className="flex items-center gap-1">
            <span
              className={
                isHindi
                  ? `bg-emerald-700 dark:bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-black ${sz.text}`
                  : `text-[#636054] dark:text-slate-400 hover:text-[#2C3327] font-semibold ${sz.text}`
              }
            >
              हिन्दी
            </span>
            <span className="text-[#A39E93] dark:text-slate-600 font-bold">/</span>
            <span
              className={
                !isHindi
                  ? `bg-emerald-700 dark:bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-black ${sz.text}`
                  : `text-[#636054] dark:text-slate-400 hover:text-[#2C3327] font-semibold ${sz.text}`
              }
            >
              EN
            </span>
          </span>
        </button>

        {/* Dropdown Trigger for all regional languages */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${sz.chevronPad} border-l border-[#D5CFBF] dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer`}
          title="अन्य भाषाएं चुनें / Select more languages"
          aria-label="Open Language Menu"
        >
          <ChevronDown
            className={`${sz.icon} transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
            }`}
          />
        </button>
      </div>

      {/* ── DROPDOWN MENU ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-2 space-y-1 animate-fadeIn">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{t('lang.select') || 'भाषा चुनें'}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">
              {currentLangObj.nativeName}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            {allAvailableLanguages.slice(0, 8).map((language) => {
              const isSelected = language.code === lang;
              return (
                <button
                  key={language.code}
                  onClick={() => handleSelectLanguage(language.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{language.flag || '🌐'}</span>
                    <div className="truncate">
                      <p className="leading-tight font-extrabold">{language.nativeName}</p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                        {language.name} {language.region ? `• ${language.region}` : ''}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

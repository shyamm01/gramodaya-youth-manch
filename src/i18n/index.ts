import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageDef } from './languages';
import { hi } from './locales/hi';
import { en } from './locales/en';
import { bho } from './locales/bho';
import { awa } from './locales/awa';
import { mr } from './locales/mr';
import { bn } from './locales/bn';

// Registry of translation dictionaries
const dictionaryRegistry: Record<string, Record<string, string>> = {
  hi,
  en,
  bho,
  awa,
  mr,
  bn,
};

/**
 * Register a new language translation dictionary dynamically at runtime
 */
export function registerLanguage(
  code: string,
  translations: Record<string, string>,
  metadata?: Partial<LanguageDef>
) {
  dictionaryRegistry[code] = {
    ...(dictionaryRegistry[code] || {}),
    ...translations,
  };

  if (metadata && !SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
    SUPPORTED_LANGUAGES.push({
      code,
      name: metadata.name || code,
      nativeName: metadata.nativeName || code,
      flag: metadata.flag || '🌐',
      region: metadata.region || '',
      dir: metadata.dir || 'ltr',
    });
  }
}

/**
 * Type-safe translation function with variable interpolation & fallback
 * Example: t('common.welcome', { name: 'Alok' }, 'hi')
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  lang: string = DEFAULT_LANGUAGE
): string {
  const currentDict = dictionaryRegistry[lang] || dictionaryRegistry[DEFAULT_LANGUAGE] || {};
  const fallbackDict = dictionaryRegistry[DEFAULT_LANGUAGE] || {};

  let text = currentDict[key] || fallbackDict[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    });
  }

  return text;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };

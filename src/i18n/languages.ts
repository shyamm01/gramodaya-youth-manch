export interface LanguageDef {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  region?: string;
  dir?: 'ltr' | 'rtl';
}

/**
 * Currently active languages (Hindi & English)
 */
export const SUPPORTED_LANGUAGES: LanguageDef[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'राष्ट्रभाषा / मुख्य' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', region: 'Global / Official' },
];

/**
 * Extensible catalog for future language activations on-demand
 */
export const EXTENDED_LANGUAGE_CATALOG: LanguageDef[] = [
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🌾', region: 'पूर्वांचल / बिहार' },
  { code: 'awa', name: 'Awadhi', nativeName: 'अवधी', flag: '🌿', region: 'अवध क्षेत्र' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🚩', region: 'महाराष्ट्र' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🌸', region: 'পশ্চিমবঙ্গ / ত্রিপুরা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '☀️', region: 'ગુજરાત' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🌾', region: 'ਪੰਜਾਬ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🏛️', region: 'ఆంధ్రప్రదేశ్ / తెలంగాణ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🛕', region: 'தமிழ்நாடு' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🌴', region: 'ಕರ್ನಾಟಕ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🥥', region: 'കേരളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🌊', region: 'ଓଡ଼ିଶା' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🌙', region: 'قومی', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'hi';

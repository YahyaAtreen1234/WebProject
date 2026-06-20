export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    nativeName: 'English',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español',
  },
  fr: {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    nativeName: 'Français',
  },
  de: {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    flag: '🇵🇹',
    nativeName: 'Português',
  },
};

export const DEFAULT_LANGUAGE = 'en';

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const isValidLanguage = (lang: string): lang is LanguageCode => {
  return lang in SUPPORTED_LANGUAGES;
};

export const getLanguageByCode = (code: string) => {
  if (isValidLanguage(code)) {
    return SUPPORTED_LANGUAGES[code];
  }
  return SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};

export const getLanguageCodes = () => {
  return Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
};

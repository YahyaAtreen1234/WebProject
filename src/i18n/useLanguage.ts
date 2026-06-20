'use client';

import { useContext, useCallback } from 'react';
import { LanguageContext } from './LanguageContext';
import { LanguageCode, isValidLanguage } from './config';

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};

export const useTranslation = () => {
  const { currentLanguage, translations } = useLanguage();

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      const keys = key.split('.');
      let value: any = translations[currentLanguage];

      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return defaultValue || key;
        }
      }

      return typeof value === 'string' ? value : defaultValue || key;
    },
    [currentLanguage, translations]
  );

  return { t, currentLanguage };
};

export const useChangeLanguage = () => {
  const { setLanguage } = useLanguage();

  const changeLanguage = useCallback(
    (lang: string) => {
      if (isValidLanguage(lang)) {
        setLanguage(lang);
        localStorage.setItem('preferred-language', lang);
        // Update URL without reload
        const pathname = window.location.pathname;
        const newPathname = `/${lang}${pathname.replace(/^\/[a-z]{2}/, '') || '/'}`;
        window.history.pushState(null, '', newPathname);
      }
    },
    [setLanguage]
  );

  return changeLanguage;
};

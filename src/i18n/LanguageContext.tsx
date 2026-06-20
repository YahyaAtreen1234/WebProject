'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, isValidLanguage } from './config';
import * as enCommon from './locales/en/common.json';
import * as esCommon from './locales/es/common.json';
import * as frCommon from './locales/fr/common.json';
import * as deCommon from './locales/de/common.json';
import * as ptCommon from './locales/pt/common.json';

type Translations = {
  [key: string]: any;
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translations: {
    [key in LanguageCode]: Translations;
  };
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

const translationMap: Record<LanguageCode, Translations> = {
  en: enCommon as unknown as Translations,
  es: esCommon as unknown as Translations,
  fr: frCommon as unknown as Translations,
  de: deCommon as unknown as Translations,
  pt: ptCommon as unknown as Translations,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get language from localStorage or browser
    const savedLanguage = localStorage.getItem('preferred-language');
    const browserLanguage = navigator.language.split('-')[0];

    let langToUse: LanguageCode = DEFAULT_LANGUAGE;

    if (savedLanguage && isValidLanguage(savedLanguage)) {
      langToUse = savedLanguage as LanguageCode;
    } else if (isValidLanguage(browserLanguage)) {
      langToUse = browserLanguage as LanguageCode;
    }

    setCurrentLanguage(langToUse);
    setIsLoaded(true);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage: setCurrentLanguage,
        translations: translationMap,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

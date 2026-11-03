import React, { createContext, useContext, useState, useEffect } from 'react';
import { bn } from '../locales/bn';
import { en } from '../locales/en';

const LanguageContext = createContext();

const translations = { bn, en };

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('israfil_lang') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('israfil_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['bn']?.[key] || key;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    const formatted = Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    if (lang === 'bn') {
      return formatted.replace(/\d/g, (digit) => bengaliDigits[digit]);
    }
    return formatted;
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (lang === 'bn') {
      const bnNum = formatted.replace(/\d/g, (digit) => bengaliDigits[digit]);
      return `৳ ${bnNum}`;
    }

    return `৳ ${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatCurrency, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

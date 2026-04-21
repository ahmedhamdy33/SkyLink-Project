import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { translations } from '../i18n/translations.js';

const PreferencesContext = createContext(null);
const fallbackCurrencies = [{ currency_code: 'USD', currency_name: 'US Dollar', symbol: '$', rate_to_usd: 1 }];

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('skylink_theme') || 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('skylink_language') || 'en');
  const [currencyCode, setCurrencyCode] = useState(localStorage.getItem('skylink_currency') || 'USD');
  const [currencies, setCurrencies] = useState(fallbackCurrencies);

  useEffect(() => {
    localStorage.setItem('skylink_theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('skylink_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    localStorage.setItem('skylink_currency', currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    api
      .getReferenceData()
      .then((data) => {
        if (data.currencies?.length) setCurrencies(data.currencies);
      })
      .catch(() => setCurrencies(fallbackCurrencies));
  }, []);

  const currency = currencies.find((item) => item.currency_code === currencyCode) || currencies[0] || fallbackCurrencies[0];

  function formatMoney(amount) {
    const converted = Number(amount || 0) * Number(currency.rate_to_usd || 1);
    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);
    const inlineSymbol = ['$', 'EUR', 'GBP', '€', '£'].includes(currency.symbol);
    return inlineSymbol ? `${currency.symbol}${formatted}` : `${currency.symbol} ${formatted}`;
  }

  const value = useMemo(
    () => ({
      theme,
      language,
      currency,
      currencies,
      t: translations[language],
      formatMoney,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'ar' : 'en')),
      setCurrencyCode
    }),
    [theme, language, currency, currencies]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

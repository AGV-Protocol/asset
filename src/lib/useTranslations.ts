'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Locale, defaultLocale } from '../../i18n';

// Simple translation cache
const translationCache = new Map<Locale, Record<string, any>>();

export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as Locale) || defaultLocale;
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      // Check cache first
      if (translationCache.has(locale)) {
        setTranslations(translationCache.get(locale)!);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/messages/${locale}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${locale}`);
        }

        const data = await response.json();
        
        // Cache the translations
        translationCache.set(locale, data);
        setTranslations(data);
      } catch (err) {
        console.error(`Failed to load translations for locale ${locale}:`, err);
        
        // Fallback to English
        if (locale !== 'en') {
          try {
            const fallbackResponse = await fetch('/messages/en.json');
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              translationCache.set(locale, fallbackData);
              setTranslations(fallbackData);
            }
          } catch (fallbackErr) {
            console.error('Failed to load fallback translations:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [locale]);

  const t = (key: string, fallback?: string) => {
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof current === 'string' ? current : (fallback || key);
  };
  
  return {
    t,
    locale,
    loading,
    translations
  };
}

export function useLocale() {
  const params = useParams();
  return (params?.locale as Locale) || defaultLocale;
}

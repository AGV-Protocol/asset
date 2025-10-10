'use client';

import { useState, useEffect } from 'react';
import { type Locale } from '../../i18n';

// Cache for client-side translations
const clientTranslationCache = new Map<Locale, Record<string, any>>();

export function useClientTranslations(locale: Locale) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTranslations() {
      // Return cached translations if available
      if (clientTranslationCache.has(locale)) {
        setTranslations(clientTranslationCache.get(locale)!);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load translations from the messages directory
        const response = await fetch(`/messages/${locale}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${locale}`);
        }

        const data = await response.json();
        
        // Cache the translations
        clientTranslationCache.set(locale, data);
        setTranslations(data);
      } catch (err) {
        console.error(`Failed to load translations for locale ${locale}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load translations');
        
        // Fallback to default locale if not already using it
        if (locale !== 'en') {
          const fallbackResponse = await fetch('/messages/en.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            clientTranslationCache.set(locale, fallbackData);
            setTranslations(fallbackData);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [locale]);

  return { translations, loading, error };
}

export function getNestedTranslation(
  translations: Record<string, any>,
  key: string,
  fallback?: string
): string {
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
}

// Hook for getting a specific translation
export function useTranslation(locale: Locale, key: string, fallback?: string) {
  const { translations, loading, error } = useClientTranslations(locale);
  
  const translation = getNestedTranslation(translations, key, fallback);
  
  return { translation, loading, error };
}

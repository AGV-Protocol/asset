import { readFileSync } from 'fs';
import { join } from 'path';
import { locales, defaultLocale, type Locale } from '../../i18n';

// Cache for loaded translations
const translationCache = new Map<Locale, Record<string, any>>();

export function getServerTranslations(locale: Locale): Record<string, any> {
  // Return cached translations if available
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    // Load translations from messages directory
    const messagesPath = join(process.cwd(), 'messages', `${locale}.json`);
    const translations = JSON.parse(readFileSync(messagesPath, 'utf-8'));
    
    // Cache the translations
    translationCache.set(locale, translations);
    
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for locale ${locale}:`, error);
    
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return getServerTranslations(defaultLocale);
    }
    
    // Return empty object as last resort
    return {};
  }
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

export function getAllServerTranslations(): Record<Locale, Record<string, any>> {
  const allTranslations: Record<Locale, Record<string, any>> = {} as any;
  
  for (const locale of locales) {
    allTranslations[locale] = getServerTranslations(locale);
  }
  
  return allTranslations;
}

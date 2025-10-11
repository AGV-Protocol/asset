import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { locales, type Locale } from '../i18n';

// Simple translation function - you can replace this with Google Translate API or other service
async function translateText(text: string, targetLang: string): Promise<string> {
  // For now, return the original text with a note
  // In production, you would use Google Translate API or similar
  console.log(`Translating "${text}" to ${targetLang}`);
  return text; // Placeholder - implement actual translation
}

async function translateMissingKeys() {
  const baseLocale: Locale = 'en';
  const basePath = join(process.cwd(), 'messages', `${baseLocale}.json`);
  const baseTranslations = JSON.parse(readFileSync(basePath, 'utf-8'));

  for (const locale of locales) {
    if (locale === baseLocale) continue;

    const localePath = join(process.cwd(), 'messages', `${locale}.json`);
    let localeTranslations: any = {};

    try {
      localeTranslations = JSON.parse(readFileSync(localePath, 'utf-8'));
    } catch (error) {
      console.log(`Creating new translation file for ${locale}`);
      localeTranslations = {};
    }

    const missingKeys = findMissingKeys(baseTranslations, localeTranslations);
    
    if (missingKeys.length > 0) {
      console.log(`Found ${missingKeys.length} missing keys for ${locale}`);
      
      for (const key of missingKeys) {
        const value = getNestedValue(baseTranslations, key);
        if (typeof value === 'string') {
          const translatedValue = await translateText(value, locale);
          setNestedValue(localeTranslations, key, translatedValue);
        }
      }

      writeFileSync(localePath, JSON.stringify(localeTranslations, null, 2));
      console.log(`Updated ${locale}.json`);
    } else {
      console.log(`No missing keys for ${locale}`);
    }
  }
}

function findMissingKeys(base: any, target: any, prefix = ''): string[] {
  const missing: string[] = [];

  for (const key in base) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof base[key] === 'object' && base[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      missing.push(...findMissingKeys(base[key], target[key], fullKey));
    } else if (typeof base[key] === 'string') {
      if (!target[key] || typeof target[key] !== 'string') {
        missing.push(fullKey);
      }
    }
  }

  return missing;
}

function getNestedValue(obj: any, key: string): any {
  const keys = key.split('.');
  let current = obj;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  
  return current;
}

function setNestedValue(obj: any, key: string, value: any): void {
  const keys = key.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }
  
  current[keys[keys.length - 1]] = value;
}

translateMissingKeys().catch(console.error);

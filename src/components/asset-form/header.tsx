"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AssetFormHeader() {
  const { t, locale, loading } = useTranslations();
  
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Image
          src="/logo.png"
          alt={t('header.subtitle', 'AGV Protocol')}
          width={40}
          height={40}
          className="rounded-lg"
        />
        <h1 className="!text-lg font-bold text-white">
          {loading ? 'Loading...' : t('header.title', 'REAL WORLD ASSETS')}
        </h1>
      </div>
      <LanguageSwitcher currentLocale={locale} />
    </header>
  );
}

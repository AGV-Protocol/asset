import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { locales, type Locale } from "../../../i18n";
import { getServerTranslations } from "@/lib/server-translations";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const translations = getServerTranslations(locale);
  
  return {
    title: translations.header?.title || "Real World Assets - AGV Protocol",
    description: translations.hero?.subtitle || "Asset registration and management platform for real-world assets",
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

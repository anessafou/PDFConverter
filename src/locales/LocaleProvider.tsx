'use client';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { LOCALES_CONFIG, type Locale } from '@/config/i18n-registry';
import { localeFromPath, localizePath } from './routing';
import { translate } from './translate';
const LocaleContext = createContext<Locale>('en');
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname ? localeFromPath(pathname) : locale;
  useEffect(() => {
    document.documentElement.lang = active;
    document.documentElement.dir = LOCALES_CONFIG[active].dir;
    document.cookie = 'NEXT_LOCALE=' + active + '; Path=/; Max-Age=31536000; SameSite=Lax';
  }, [active]);
  return <LocaleContext.Provider value={active}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
export function useTranslations() {
  const locale = useLocale();
  return useMemo(() => (text: string) => translate(locale, text), [locale]);
}
export function useLocalizedPath() {
  const locale = useLocale();
  return useMemo(() => (href: string) => localizePath(href, locale), [locale]);
}

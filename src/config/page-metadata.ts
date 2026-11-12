import type { Metadata } from 'next';
import { SUPPORTED_LOCALES, type Locale } from './i18n-registry';

export const SITE_URL = 'https://www.pdfconverter.space';

const socialLocales: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  de: 'de_DE',
  ar: 'ar_SA',
};

export function pageMetadata(
  locale: Locale,
  title: string,
  description: string,
  canonical: string,
  languages: Record<string, string>,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'PDFConverter',
      type: 'website',
      locale: socialLocales[locale],
      alternateLocale: SUPPORTED_LOCALES.filter(other => other !== locale && languages[other])
        .map(other => socialLocales[other]),
      images: [{ url: SITE_URL + '/opengraph-image', width: 1200, height: 630, alt: 'PDFConverter' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: SITE_URL + '/opengraph-image', alt: 'PDFConverter' }],
    },
  };
}

export function existingPathAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(SUPPORTED_LOCALES.map(locale => [
      locale, SITE_URL + (locale === 'en' ? '' : '/' + locale) + path,
    ])),
    'x-default': SITE_URL + path,
  };
}

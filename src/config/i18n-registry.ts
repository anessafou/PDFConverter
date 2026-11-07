// src/config/i18n-registry.ts

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'ar'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleMeta {
  code: Locale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const LOCALES_CONFIG: Record<Locale, LocaleMeta> = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
};

/**
 * Bi-directional Localized Slugs Map
 * Maps canonical English toolSlug -> native high-intent keyword slugs.
 */
export const LOCALIZED_SLUGS: Record<string, Partial<Record<Locale, string>>> = {
  // ─── Top High-Volume Tools ─────────────────────────────────────────
  'word-to-pdf': {
    en: 'word-to-pdf',
    fr: 'convertir-word-en-pdf',
    es: 'convertir-word-a-pdf',
    de: 'word-in-pdf-umwandeln',
    ar: 'word-to-pdf',
  },
  'pdf-to-word': {
    en: 'pdf-to-word',
    fr: 'convertir-pdf-en-word',
    es: 'convertir-pdf-a-word',
    de: 'pdf-in-word-umwandeln',
    ar: 'pdf-to-word',
  },
  'excel-to-pdf': {
    en: 'excel-to-pdf',
    fr: 'convertir-excel-en-pdf',
    es: 'convertir-excel-a-pdf',
    de: 'excel-in-pdf-umwandeln',
    ar: 'excel-to-pdf',
  },
  'pdf-to-excel': {
    en: 'pdf-to-excel',
    fr: 'convertir-pdf-en-excel',
    es: 'convertir-pdf-a-excel',
    de: 'pdf-in-excel-umwandeln',
    ar: 'pdf-to-excel',
  },
  'ppt-to-pdf': {
    en: 'ppt-to-pdf',
    fr: 'convertir-powerpoint-en-pdf',
    es: 'convertir-powerpoint-a-pdf',
    de: 'powerpoint-in-pdf-umwandeln',
    ar: 'ppt-to-pdf',
  },
  'pdf-to-ppt': {
    en: 'pdf-to-ppt',
    fr: 'convertir-pdf-en-powerpoint',
    es: 'convertir-pdf-a-powerpoint',
    de: 'pdf-in-powerpoint-umwandeln',
    ar: 'pdf-to-ppt',
  },
  'jpg-to-pdf': {
    en: 'jpg-to-pdf',
    fr: 'convertir-jpg-en-pdf',
    es: 'convertir-jpg-a-pdf',
    de: 'jpg-in-pdf-umwandeln',
    ar: 'jpg-to-pdf',
  },
  'pdf-to-jpg': {
    en: 'pdf-to-jpg',
    fr: 'convertir-pdf-en-jpg',
    es: 'convertir-pdf-a-jpg',
    de: 'pdf-in-jpg-umwandeln',
    ar: 'pdf-to-jpg',
  },
  'png-to-pdf': {
    en: 'png-to-pdf',
    fr: 'convertir-png-en-pdf',
    es: 'convertir-png-a-pdf',
    de: 'png-in-pdf-umwandeln',
    ar: 'png-to-pdf',
  },
  'pdf-to-png': {
    en: 'pdf-to-png',
    fr: 'convertir-pdf-en-png',
    es: 'convertir-pdf-a-png',
    de: 'pdf-in-png-umwandeln',
    ar: 'pdf-to-png',
  },
  'heic-to-jpg': {
    en: 'heic-to-jpg',
    fr: 'convertir-heic-en-jpg',
    es: 'convertir-heic-a-jpg',
    de: 'heic-in-jpg-umwandeln',
    ar: 'heic-to-jpg',
  },
  'heic-to-pdf': {
    en: 'heic-to-pdf',
    fr: 'convertir-heic-en-pdf',
    es: 'convertir-heic-a-pdf',
    de: 'heic-in-pdf-umwandeln',
    ar: 'heic-to-pdf',
  },
  'html-to-pdf': {
    en: 'html-to-pdf',
    fr: 'convertir-html-en-pdf',
    es: 'convertir-html-a-pdf',
    de: 'html-in-pdf-umwandeln',
    ar: 'html-to-pdf',
  },
  'pdf-to-txt': {
    en: 'pdf-to-txt',
    fr: 'convertir-pdf-en-texte',
    es: 'convertir-pdf-a-texto',
    de: 'pdf-in-text-umwandeln',
    ar: 'pdf-to-txt',
  },
  'txt-to-pdf': {
    en: 'txt-to-pdf',
    fr: 'convertir-texte-en-pdf',
    es: 'convertir-texto-a-pdf',
    de: 'text-in-pdf-umwandeln',
    ar: 'txt-to-pdf',
  },
  'pdf-to-scanned-document': {
    en: 'pdf-to-scanned-document',
    fr: 'creer-pdf-numerise',
    es: 'crear-pdf-escaneado',
    de: 'gescanntes-pdf-erstellen',
    ar: 'pdf-to-scanned-document',
  },

  // ─── Dedicated Utilities ───────────────────────────────────────────
  'image-converter': {
    en: 'image-converter',
    fr: 'convertisseur-image',
    es: 'convertidor-de-imagenes',
    de: 'bild-konverter',
    ar: 'image-converter',
  },
  'view-documents-online': {
    en: 'view-documents-online',
    fr: 'lecteur-documents-en-ligne',
    es: 'visor-de-documentos-online',
    de: 'dokumente-online-anzeigen',
    ar: 'view-documents-online',
  },
  'markdown-editor': {
    en: 'markdown-editor',
    fr: 'editeur-markdown',
    es: 'editor-markdown',
    de: 'markdown-editor',
    ar: 'markdown-editor',
  },
};

/**
 * Returns the localized slug for a given canonical tool and locale.
 * Falls back to the canonical slug if not explicitly defined.
 */
export function getLocalizedSlug(canonicalSlug: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return canonicalSlug;
  return LOCALIZED_SLUGS[canonicalSlug]?.[locale] || canonicalSlug;
}

/**
 * Looks up the canonical English tool slug given a localized slug and locale.
 */
export function getCanonicalSlugFromLocalized(
  localizedSlug: string,
  locale: Locale
): string | null {
  if (locale === DEFAULT_LOCALE) return localizedSlug;

  for (const [canonical, map] of Object.entries(LOCALIZED_SLUGS)) {
    if (map[locale] === localizedSlug) {
      return canonical;
    }
  }

  // Fallback: check if the localized slug matches the canonical slug directly
  return localizedSlug;
}

/**
 * Generates the full hreflang alternate links object for Next.js metadata.
 */
export function generateHreflangAlternates(canonicalSlug?: string) {
  const baseUrl = 'https://www.pdfconverter.space';

  if (!canonicalSlug || canonicalSlug === 'site') {
    // Homepage alternates
    return {
      canonical: baseUrl,
      languages: {
        en: baseUrl,
        fr: `${baseUrl}/fr`,
        es: `${baseUrl}/es`,
        de: `${baseUrl}/de`,
        ar: `${baseUrl}/ar`,
        'x-default': baseUrl,
      },
    };
  }

  const enSlug = canonicalSlug;
  const frSlug = getLocalizedSlug(canonicalSlug, 'fr');
  const esSlug = getLocalizedSlug(canonicalSlug, 'es');
  const deSlug = getLocalizedSlug(canonicalSlug, 'de');
  const arSlug = getLocalizedSlug(canonicalSlug, 'ar');

  return {
    canonical: `${baseUrl}/${enSlug}`,
    languages: {
      en: `${baseUrl}/${enSlug}`,
      fr: `${baseUrl}/fr/${frSlug}`,
      es: `${baseUrl}/es/${esSlug}`,
      de: `${baseUrl}/de/${deSlug}`,
      ar: `${baseUrl}/ar/${arSlug}`,
      'x-default': `${baseUrl}/${enSlug}`,
    },
  };
}
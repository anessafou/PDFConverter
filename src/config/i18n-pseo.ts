// src/config/i18n-pseo.ts
import { Locale } from '@/config/i18n-registry';
import { PseoModifier, TOOLS_REGISTRY, getAllValidPseoSlugs } from '@/config/tools-registry';

export const LOCALIZED_MODIFIERS: Record<Locale, Record<PseoModifier, string>> = {
  en: {
    'for-mac': 'for-mac',
    'for-windows': 'for-windows',
    'on-iphone': 'on-iphone',
    'without-watermark': 'without-watermark',
  },
  fr: {
    'for-mac': 'sur-mac',
    'for-windows': 'sur-windows',
    'on-iphone': 'sur-iphone',
    'without-watermark': 'sans-filigrane',
  },
  es: {
    'for-mac': 'en-mac',
    'for-windows': 'en-windows',
    'on-iphone': 'en-iphone',
    'without-watermark': 'sin-marca-de-agua',
  },
  de: {
    'for-mac': 'fuer-mac',
    'for-windows': 'fuer-windows',
    'on-iphone': 'auf-dem-iphone',
    'without-watermark': 'ohne-wasserzeichen',
  },
  ar: {
    'for-mac': 'for-mac',
    'for-windows': 'for-windows',
    'on-iphone': 'on-iphone',
    'without-watermark': 'without-watermark',
  },
};

export function resolveLocalizedPseo(
  locale: Locale,
  slug: string
): { canonicalToolSlug: string; modifier: PseoModifier } | null {
  const modMap = LOCALIZED_MODIFIERS[locale];

  for (const [canonicalMod, localizedMod] of Object.entries(modMap)) {
    if (slug.endsWith(`-${localizedMod}`)) {
      const toolPart = slug.slice(0, -(localizedMod.length + 1));
      return {
        canonicalToolSlug: toolPart,
        modifier: canonicalMod as PseoModifier,
      };
    }
  }

  for (const [canonicalMod] of Object.entries(LOCALIZED_MODIFIERS.en)) {
    if (slug.endsWith(`-${canonicalMod}`)) {
      const toolPart = slug.slice(0, -(canonicalMod.length + 1));
      return {
        canonicalToolSlug: toolPart,
        modifier: canonicalMod as PseoModifier,
      };
    }
  }

  return null;
}

/**
 * كتجمع جميع روابط الـ pSEO: الإنجليزية + المترجمة (fr, es, de, ar)
 */
export function getAllPseoPaths(): string[] {
  const paths: string[] = [];

  // 1. الإنجليزية (/p/...)
  for (const slug of getAllValidPseoSlugs()) {
    paths.push(`/p/${slug}`);
  }

  // 2. المترجمة (/[locale]/p/...)
  const locales: Locale[] = ['fr', 'es', 'de', 'ar'];
  const conversionTools = Object.values(TOOLS_REGISTRY).filter((t) => t.category !== 'utility');
  const validModifiers = Object.keys(LOCALIZED_MODIFIERS.en) as Array<keyof typeof LOCALIZED_MODIFIERS['en']>;

  for (const locale of locales) {
    for (const tool of conversionTools) {
      for (const mod of validModifiers) {
        const localizedMod = LOCALIZED_MODIFIERS[locale][mod];
        paths.push(`/${locale}/p/${tool.slug}-${localizedMod}`);
      }
    }
  }

  return paths;
}
// src/app/[toolSlug]/p/[pseoSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  SUPPORTED_LOCALES,
  Locale,
  generateHreflangAlternates,
} from '@/config/i18n-registry';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { resolveLocalizedPseo, LOCALIZED_MODIFIERS } from '@/config/i18n-pseo';

import FrenchPseoTemplate from '@/components/pseo/templates/FrenchPseoTemplate';
import SpanishPseoTemplate from '@/components/pseo/templates/SpanishPseoTemplate';
import GermanPseoTemplate from '@/components/pseo/templates/GermanPseoTemplate';
import ArabicPseoTemplate from '@/components/pseo/templates/ArabicPseoTemplate';

export const revalidate = 60;
export const dynamicParams = false;

// Statically pre-render only legitimate localized pSEO routes at build time
export async function generateStaticParams() {
  const locales: Locale[] = ['fr', 'es', 'de', 'ar'];
  const params: { toolSlug: string; pseoSlug: string }[] = [];

  const conversionTools = Object.values(TOOLS_REGISTRY).filter((t) => t.category !== 'utility');
  
  // TS Fix: Derive valid modifiers directly from the localized registry to guarantee type safety
  const validModifiers = Object.keys(LOCALIZED_MODIFIERS.en) as Array<keyof typeof LOCALIZED_MODIFIERS['en']>;

  for (const locale of locales) {
    for (const tool of conversionTools) {
      for (const mod of validModifiers) {
        const localizedMod = LOCALIZED_MODIFIERS[locale][mod];
        params.push({
          toolSlug: locale, // using folder param name but injecting locale
          pseoSlug: `${tool.slug}-${localizedMod}`,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolSlug: string; pseoSlug: string }>;
}): Promise<Metadata> {
  const { toolSlug, pseoSlug } = await params;
  const locale = toolSlug as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) return {};

  const match = resolveLocalizedPseo(locale, pseoSlug);
  if (!match || !TOOLS_REGISTRY[match.canonicalToolSlug]) return {};

  const tool = TOOLS_REGISTRY[match.canonicalToolSlug];
  const hreflang = generateHreflangAlternates(match.canonicalToolSlug);

  return {
    title: `${tool.name} - PDFConverter`,
    alternates: {
      canonical: `https://www.pdfconverter.space/${locale}/p/${pseoSlug}`,
      languages: hreflang.languages,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedPseoPage({
  params,
}: {
  params: Promise<{ toolSlug: string; pseoSlug: string }>;
}) {
  const { toolSlug, pseoSlug } = await params;
  const locale = toolSlug as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) notFound();

  const match = resolveLocalizedPseo(locale, pseoSlug);
  if (!match || !TOOLS_REGISTRY[match.canonicalToolSlug]) notFound();

  const tool = TOOLS_REGISTRY[match.canonicalToolSlug];

  // Strictly dispatch to culturally differentiated templates
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      {locale === 'fr' && (
        <FrenchPseoTemplate tool={tool} modifier={match.modifier as any} canonicalSlug={tool.slug} />
      )}
      {locale === 'es' && (
        <SpanishPseoTemplate tool={tool} modifier={match.modifier as any} canonicalSlug={tool.slug} />
      )}
      {locale === 'de' && (
        <GermanPseoTemplate tool={tool} modifier={match.modifier as any} canonicalSlug={tool.slug} />
      )}
      {locale === 'ar' && (
        <ArabicPseoTemplate tool={tool} modifier={match.modifier as any} canonicalSlug={tool.slug} />
      )}
    </main>
  );
}
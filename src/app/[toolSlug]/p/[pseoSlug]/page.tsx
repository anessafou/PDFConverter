import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { localizedPseoHeading, localizedPseoMetadata } from '@/config/localized-pseo-metadata';
import { SITE_URL } from '@/config/page-metadata';
import JsonLd from '@/components/JsonLd';
// src/app/[toolSlug]/p/[pseoSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  SUPPORTED_LOCALES,
  Locale,
} from '@/config/i18n-registry';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { getPublishedPseoPages, resolvePublishedPseo } from '@/config/pseo-publication';

import FrenchPseoTemplate from '@/components/pseo/templates/FrenchPseoTemplate';
import SpanishPseoTemplate from '@/components/pseo/templates/SpanishPseoTemplate';
import GermanPseoTemplate from '@/components/pseo/templates/GermanPseoTemplate';
import ArabicPseoTemplate from '@/components/pseo/templates/ArabicPseoTemplate';

export const revalidate = 60;
export const dynamicParams = false;

// Statically pre-render only legitimate localized pSEO routes at build time
export async function generateStaticParams() {
  return getPublishedPseoPages().filter(page => page.locale !== 'en').map(page => ({
    toolSlug: page.locale, pseoSlug: page.path.split('/').at(-1)!,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolSlug: string; pseoSlug: string }>;
}): Promise<Metadata> {
  const { toolSlug, pseoSlug } = await params;
  const locale = toolSlug as Locale;

  if (locale === 'en' || !SUPPORTED_LOCALES.includes(locale)) return {};

  const match = resolvePublishedPseo(locale, pseoSlug);
  if (!match || match.intent.kind !== 'platform' || !TOOLS_REGISTRY[match.toolSlug]) return {};

  return localizedPseoMetadata(match);
}

export default async function LocalizedPseoPage({
  params,
}: {
  params: Promise<{ toolSlug: string; pseoSlug: string }>;
}) {
  const { toolSlug, pseoSlug } = await params;
  const locale = toolSlug as Locale;

  if (locale === 'en' || !SUPPORTED_LOCALES.includes(locale)) notFound();

  const match = resolvePublishedPseo(locale, pseoSlug);
  if (!match || match.intent.kind !== 'platform' || !TOOLS_REGISTRY[match.toolSlug]) notFound();

  const tool = TOOLS_REGISTRY[match.toolSlug];

  const url = SITE_URL + match.path;
  const name = localizedPseoHeading(locale, tool.slug, match.intent.modifier);
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebPage', url, name, inLanguage: locale,
      }} />
      <div className="max-w-4xl mx-auto mb-4">
        <Breadcrumbs locale={locale} centered trail={[...toolTrail(locale, tool), { href: match.path, name }]} />
      </div>
      {locale === 'fr' && (
        <FrenchPseoTemplate tool={tool} modifier={match.intent.modifier} canonicalSlug={tool.slug} />
      )}
      {locale === 'es' && (
        <SpanishPseoTemplate tool={tool} modifier={match.intent.modifier} canonicalSlug={tool.slug} />
      )}
      {locale === 'de' && (
        <GermanPseoTemplate tool={tool} modifier={match.intent.modifier} canonicalSlug={tool.slug} />
      )}
      {locale === 'ar' && (
        <ArabicPseoTemplate tool={tool} modifier={match.intent.modifier} canonicalSlug={tool.slug} />
      )}
    </main>
  );
}

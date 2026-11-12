import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { pageMetadata } from '@/config/page-metadata';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
import { localizePath } from '@/locales/routing';
export const dynamic = 'force-dynamic';
// src/app/p/[pseoSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  TOOLS_REGISTRY,
  ToolDefinition,
  PseoModifier,
} from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import { getPublishedPseoPages, resolvePublishedPseo, getPublishedPlatformModifiers, getPseoLanguageAlternates } from '@/config/pseo-publication';
import { getEnglishIntentPage } from '@/config/english-pseo-content';
import EnglishIntentTemplate, { englishIntentMetadata } from '@/components/pseo/templates/EnglishIntentTemplate';
import EnglishIntentLinks from '@/components/pseo/EnglishIntentLinks';
import { getPlatformContent } from '@/config/english-platform-content';
import { englishToolCapability } from '@/config/english-tool-capabilities';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = getPublishedPseoPages('en').map(page => page.path.split('/').at(-1)!);
  return slugs.map((pseoSlug) => ({ pseoSlug }));
}

interface PseoContext {
  tool: ToolDefinition;
  modifier: PseoModifier;
  cleanModifierName: string;
  allowedModifiers: readonly PseoModifier[];
}

function parsePseoSlug(slug: string): PseoContext | null {
  const page = resolvePublishedPseo('en', slug);
  if (!page || page.intent.kind !== 'platform') return null;
  return { tool: TOOLS_REGISTRY[page.toolSlug], modifier: page.intent.modifier,
    cleanModifierName: formatModifierLabel(page.intent.modifier),
    allowedModifiers: getPublishedPlatformModifiers(page.toolSlug) };
}

function formatModifierLabel(modifier: PseoModifier): string {
  switch (modifier) {
    case 'for-mac':
      return 'for Mac';
    case 'for-windows':
      return 'for Windows';
    case 'on-iphone':
      return 'on iPhone';
    case 'without-watermark':
      return 'and Watermarks';
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pseoSlug: string }>;
}): Promise<Metadata> {
  const { pseoSlug } = await params;
  const publication = resolvePublishedPseo('en', pseoSlug);
  const intent = publication?.intent.kind === 'task' ? getEnglishIntentPage(pseoSlug) : null;
  if (intent) return englishIntentMetadata(intent);
  const parsed = parsePseoSlug(pseoSlug);
  if (!parsed) return {};

  const { tool, modifier, cleanModifierName } = parsed;
  const canonical = `https://www.pdfconverter.space/p/${pseoSlug}`;
  const capability = englishToolCapability(tool);
  const content = getPlatformContent(tool, modifier);
  const description = content.metaDescription ?? `${tool.name} ${cleanModifierName}. ${capability.summary.split('. ')[0].replace(/\.$/, '')}.`;
  const title = content.metaTitle ?? `${tool.name} ${cleanModifierName} - Free Online Converter | PDFConverter`;

  const languages = getPseoLanguageAlternates('/p/' + pseoSlug);
  return {
    ...pageMetadata('en', title, description, canonical, { ...languages, 'x-default': canonical }),
    robots: { index: true, follow: true },
  };
}

export default async function PseoPage({
  params,
}: {
  params: Promise<{ pseoSlug: string }>;
}) {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);
  const linkTo = (href: string) => localizePath(href, locale);

  const { pseoSlug } = await params;
  const publication = resolvePublishedPseo('en', pseoSlug);
  const intent = publication?.intent.kind === 'task' ? getEnglishIntentPage(pseoSlug) : null;
  if (intent) return <EnglishIntentTemplate page={intent} />;
  const parsed = parsePseoSlug(pseoSlug);

  if (!parsed) notFound();

  const { tool, modifier, cleanModifierName, allowedModifiers } = parsed;
  const content = getPlatformContent(tool, modifier);
  const capability = englishToolCapability(tool);

  const { stats, reviews } = await getPublicReviewData(tool.slug);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <ReviewSchema
        toolName={t(tool.name)}
        toolDescription={capability.summary}
        toolSlug={tool.slug}
        stats={stats}
        reviews={reviews}
      />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        <Breadcrumbs locale={locale} centered trail={[
          ...toolTrail(locale, tool),
          { href: '/p/' + pseoSlug, name: t(cleanModifierName) },
        ]} />

        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">{t(stats.ratingValue.toFixed(1).replace('.', ','))}</span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({t(stats.reviewCount.toLocaleString())})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">{t("Free")}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {content.h1 ? <>
            {content.h1Accent ? t(content.h1.slice(0, -content.h1Accent.length).trim()) : t(content.h1)}
            {content.h1Accent && <> <span className="text-[#FF2E54]">{t(content.h1Accent)}</span></>}
          </> : <>{t(tool.name)} <span className="text-[#FF2E54]">{t(cleanModifierName)}</span></>}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {content.guideText}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2 text-left">
          {content.specs.map((spec, i) => (
            <div key={i} className="p-2.5 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t(spec.label)}</span>
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={t(spec.value)}>{t(spec.value)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <ConverterWidget tool={tool} />
        </div>

        {allowedModifiers.length > 1 && (
          <div className="p-3 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">{t("Other options:")}</span>
            {allowedModifiers
              .filter((m) => m !== modifier)
              .map((altMod) => (
                <Link
                  key={altMod}
                  href={linkTo(`/p/${tool.slug}-${altMod}`)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-[#FF2E54] font-semibold rounded-lg transition-colors"
                >
                  {t(formatModifierLabel(altMod))}
                </Link>
              ))}
          </div>
        )}

        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="inline-block px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] text-xs font-bold rounded-lg mb-2">
            {content.heroBadge}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {content.guideTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {t("Follow these simple steps to complete your conversion without installing third-party apps:")}</p>

          <div className="grid gap-3 mb-8">
            {content.steps.map((st) => (
              <div key={st.num} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t(st.num)}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t(st.title)}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t(st.desc)}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            {t("Frequently Asked Questions")}</h3>
          <div className="space-y-4">
            {content.faqs.map((f, i) => (
              <div key={i} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {t(f.q)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t(f.a)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <EnglishIntentLinks toolSlug={tool.slug} />
        <ReviewSection
          itemSlug={tool.slug}
          toolName={t(tool.name)}
          initialStats={stats}
          initialReviews={reviews}
        />
      </div>
    </main>
  );
}

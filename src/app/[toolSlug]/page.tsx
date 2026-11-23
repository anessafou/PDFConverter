import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { pageMetadata } from '@/config/page-metadata';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
import { localizePath } from '@/locales/routing';
export const dynamic = 'force-dynamic';
// src/app/[toolSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS_REGISTRY, PseoModifier } from '@/config/tools-registry';
import { getPublishedPlatformModifiers } from '@/config/pseo-publication';
import { SUPPORTED_LOCALES, Locale, generateHreflangAlternates } from '@/config/i18n-registry';
import { DICTIONARIES } from '@/locales/dictionaries';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import HomeTemplate from '@/components/pseo/templates/HomeTemplate';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import EnglishIntentLinks from '@/components/pseo/EnglishIntentLinks';
import { getEnglishCoreToolGuide } from '@/config/english-core-tool-content';

function formatModifierLabel(mod: PseoModifier): string {
  switch (mod) {
    case 'for-mac': return 'for Mac';
    case 'for-windows': return 'for Windows';
    case 'on-iphone': return 'on iPhone';
    case 'without-watermark': return 'and Watermarks';
  }
}

export async function generateMetadata({ params }: { params: Promise<{ toolSlug: string }> }): Promise<Metadata> {
  const { toolSlug } = await params;
  const locale = SUPPORTED_LOCALES.includes(toolSlug as Locale) ? toolSlug as Locale : 'en';
  const home = SUPPORTED_LOCALES.includes(toolSlug as Locale);
  if (!home && !Object.hasOwn(TOOLS_REGISTRY, toolSlug)) return {};
  const copy = home ? DICTIONARIES[locale].home : DICTIONARIES.en.tools[toolSlug];
  const alternates = generateHreflangAlternates(home ? undefined : toolSlug);
  const canonical = alternates.languages[locale];
  return pageMetadata(locale, copy.title, copy.description, canonical, alternates.languages);
}

export default async function ToolOrLocalePage({
  params,
}: {
  params: Promise<{ toolSlug: string }>;
}) {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);
  const linkTo = (href: string) => localizePath(href, locale);

  const { toolSlug } = await params;

  // 1. Localized homepage check
  if (SUPPORTED_LOCALES.includes(toolSlug as Locale)) {
    const locale = toolSlug as Locale;
    return <HomeTemplate locale={locale} />;
  }

  // 2. English Tool logic
  const tool = TOOLS_REGISTRY[toolSlug];
  if (!tool) notFound();

  // Get configured pSEO variants for this tool (e.g. ['for-mac', 'for-windows', ...])
  const copy = DICTIONARIES[locale].tools[tool.slug];
  const englishGuide = locale === 'en' ? getEnglishCoreToolGuide(tool.slug) : null;
  const allowedModifiers = getPublishedPlatformModifiers(tool.slug);

  const { stats, reviews } = await getPublicReviewData(tool.slug);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <ReviewSchema toolName={t(tool.name)} toolDescription={copy.description} toolSlug={tool.slug} stats={stats} reviews={reviews} />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        <Breadcrumbs locale={locale} centered trail={toolTrail(locale, tool)} />
        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">{t(stats.ratingValue.toFixed(1).replace('.', ','))}</span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({t(stats.reviewCount.toLocaleString())})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">{t("Free")}</span>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {copy.h1}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {englishGuide?.introduction ?? copy.description}
        </p>

        <ConverterWidget tool={tool} />

        {/* ─── FIX: INTERNAL LINKS TO PSEO PAGES (ELIMINATES ORPHAN STATUS) ─── */}
        {allowedModifiers.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="p-4 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                {t("Specialized Guides & Platforms:")}</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {allowedModifiers.map((mod) => (
                  <Link
                    key={mod}
                    href={linkTo(`/p/${tool.slug}-${mod}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-[#FF2E54] dark:text-slate-300 dark:hover:text-[#FF2E54] text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
                  >
                    {t(tool.name)} {t(formatModifierLabel(mod))}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {locale === 'en' && <EnglishIntentLinks toolSlug={tool.slug} />}
        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          {englishGuide && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{englishGuide.heading}</h2>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-3">{englishGuide.stepsHeading}</h3>
              <ol className="list-decimal pl-5 space-y-3 mb-6">
                {englishGuide.steps.map((step) => (
                  <li key={step.title}>
                    <strong className="text-sm text-slate-700 dark:text-slate-300">{step.title}</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.body}</p>
                  </li>
                ))}
              </ol>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{englishGuide.guidanceHeading}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">{englishGuide.guidance}</p>
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t("Frequently Asked Questions")}</h2>
          <div className="space-y-4">
            {copy.faqs?.map(faq => (
              <div key={faq.q}>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{faq.q}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <ReviewSection itemSlug={tool.slug} toolName={t(tool.name)} initialStats={stats} initialReviews={reviews} />
      </div>
    </main>
  );
}

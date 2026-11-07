// src/app/[toolSlug]/[localizedSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  SUPPORTED_LOCALES,
  Locale,
  LOCALES_CONFIG,
  getCanonicalSlugFromLocalized,
  generateHreflangAlternates,
} from '@/config/i18n-registry';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { DICTIONARIES } from '@/locales/dictionaries';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { reviewsRepository } from '@/core/reviews/reviews-repository';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolSlug: string; localizedSlug: string }>;
}): Promise<Metadata> {
  const { toolSlug, localizedSlug } = await params;
  
  // toolSlug represents the locale in this nested route (e.g., /fr/convertir-word-en-pdf)
  const locale = toolSlug as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return {};
  }

  const canonicalSlug = getCanonicalSlugFromLocalized(localizedSlug, locale);
  if (!canonicalSlug || !TOOLS_REGISTRY[canonicalSlug]) {
    return {};
  }

  const tool = TOOLS_REGISTRY[canonicalSlug];
  const dict = DICTIONARIES[locale];
  const toolContent = dict.tools[canonicalSlug];

  const title = toolContent?.title || `${tool.name} - PDFConverter`;
  const description = toolContent?.description || tool.description;
  const hreflang = generateHreflangAlternates(canonicalSlug);

  return {
    title,
    description,
    alternates: {
      canonical: hreflang.languages[locale],
      languages: hreflang.languages,
    },
    openGraph: {
      title,
      description,
      url: hreflang.languages[locale],
      siteName: 'PDFConverter',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function LocalizedToolPage({
  params,
}: {
  params: Promise<{ toolSlug: string; localizedSlug: string }>;
}) {
  const { toolSlug, localizedSlug } = await params;
  const locale = toolSlug as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  const isRTL = LOCALES_CONFIG[locale]?.dir === 'rtl';

  const canonicalSlug = getCanonicalSlugFromLocalized(localizedSlug, locale);
  if (!canonicalSlug || !TOOLS_REGISTRY[canonicalSlug]) {
    notFound();
  }

  const tool = TOOLS_REGISTRY[canonicalSlug];
  const dict = DICTIONARIES[locale];
  const toolContent = dict.tools[canonicalSlug];

  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats(tool.slug),
    reviewsRepository.getPublishedReviews(tool.slug, { limit: 20 }),
  ]);

  const hreflang = generateHreflangAlternates(canonicalSlug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: dict.common.allTools,
        item: hreflang.languages[locale].replace(`/${localizedSlug}`, ''),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: toolContent?.h1 || tool.name,
        item: hreflang.languages[locale],
      },
    ],
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c'),
        }}
      />

      <ReviewSchema
        toolName={toolContent?.h1 || tool.name}
        toolDescription={toolContent?.description || tool.description}
        toolSlug={canonicalSlug}
        stats={stats}
        reviews={reviews}
      />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">
              {stats.ratingValue.toFixed(1).replace('.', ',')}
            </span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({stats.reviewCount.toLocaleString()})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">{dict.common.freeBadge.split('•')[0].trim()}</span>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {toolContent?.h1 || tool.name}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {toolContent?.description || tool.description}
        </p>

        <ConverterWidget tool={tool} />

        {toolContent?.faqs && toolContent.faqs.length > 0 && (
          <section className={`text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8 ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              {dict.common.faqTitle}
            </h2>
            <div className="space-y-4">
              {toolContent.faqs.map((faq: { q: string; a: string }, i: number) => (
                <div key={i} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewSection
          itemSlug={canonicalSlug}
          toolName={toolContent?.h1 || tool.name}
          initialStats={stats}
          initialReviews={reviews}
        />
      </div>
    </div>
  );
}
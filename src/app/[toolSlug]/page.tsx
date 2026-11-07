// src/app/[toolSlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS_REGISTRY, PSEO_CONFIG, PseoModifier } from '@/config/tools-registry';
import { SUPPORTED_LOCALES, Locale, generateHreflangAlternates } from '@/config/i18n-registry';
import { DICTIONARIES } from '@/locales/dictionaries';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import HomeTemplate from '@/components/pseo/templates/HomeTemplate';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';

function formatModifierLabel(mod: PseoModifier): string {
  switch (mod) {
    case 'for-mac': return 'for Mac';
    case 'for-windows': return 'for Windows';
    case 'on-iphone': return 'on iPhone';
    case 'without-watermark': return 'without Watermark';
  }
}

// ... keep generateStaticParams and generateMetadata ...

export default async function ToolOrLocalePage({
  params,
}: {
  params: Promise<{ toolSlug: string }>;
}) {
  const { toolSlug } = await params;

  // 1. Localized homepage check
  if (SUPPORTED_LOCALES.includes(toolSlug as Locale)) {
    const locale = toolSlug as Locale;
    const [stats, reviews] = await Promise.all([
      reviewsRepository.getAggregateStats('site'),
      reviewsRepository.getPublishedReviews('site', { limit: 50 }),
    ]);
    return <HomeTemplate locale={locale} stats={stats} reviews={reviews} />;
  }

  // 2. English Tool logic
  const tool = TOOLS_REGISTRY[toolSlug];
  if (!tool) notFound();

  // Get configured pSEO variants for this tool (e.g. ['for-mac', 'for-windows', ...])
  const allowedModifiers = PSEO_CONFIG[tool.slug] || [];

  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats(tool.slug),
    reviewsRepository.getPublishedReviews(tool.slug, { limit: 20 }),
  ]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.pdfconverter.space' },
      { '@type': 'ListItem', position: 2, name: tool.name, item: `https://www.pdfconverter.space/${tool.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <ReviewSchema toolName={tool.name} toolDescription={tool.description} toolSlug={tool.slug} stats={stats} reviews={reviews} />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">{stats.ratingValue.toFixed(1).replace('.', ',')}</span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({stats.reviewCount.toLocaleString()})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">Free</span>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {tool.description}
        </p>

        <ConverterWidget tool={tool} />

        {/* ─── FIX: INTERNAL LINKS TO PSEO PAGES (ELIMINATES ORPHAN STATUS) ─── */}
        {allowedModifiers.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="p-4 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Specialized Guides &amp; Platforms:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {allowedModifiers.map((mod) => (
                  <Link
                    key={mod}
                    href={`/p/${tool.slug}-${mod}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-[#FF2E54] dark:text-slate-300 dark:hover:text-[#FF2E54] text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
                  >
                    {tool.name} {formatModifierLabel(mod)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Is this {tool.name} free to use?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Yes, our converter is free to use online with no sign-up or watermarks required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Are my documents secure?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Client-supported operations process in your browser. Any temporary files are purged automatically.</p>
            </div>
          </div>
        </section>

        <ReviewSection itemSlug={tool.slug} toolName={tool.name} initialStats={stats} initialReviews={reviews} />
      </div>
    </main>
  );
}
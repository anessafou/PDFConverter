import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import LocalizedGuideLinks from '@/components/pseo/LocalizedGuideLinks';
import { existingPathAlternates, pageMetadata } from '@/config/page-metadata';


import ImageConverterClient from '@/app/image-converter/ImageConverterClient';
import DocumentViewerClient from '@/app/view-documents-online/DocumentViewerClient';
import MarkdownEditorClient from '@/app/markdown-editor/MarkdownEditorClient';
import ContactPage from '@/app/contact/page';
import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';
import { translate } from '@/locales/translate';
export const dynamic = 'force-dynamic';
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
import { getPublicReviewData } from '@/core/reviews/public-review-data';

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

  if (['contact', 'privacy', 'terms'].includes(localizedSlug)) {
    const label = ({ contact: 'Contact Support', privacy: 'Privacy Policy', terms: 'Terms of Service' })[localizedSlug as 'contact' | 'privacy' | 'terms'];
    const languages = existingPathAlternates('/' + localizedSlug);
    const descriptions = {
      contact: 'Get in touch with the PDFConverter team for questions, tool requests, bug reports, and support.',
      privacy: 'Learn how PDFConverter handles your documents and data.',
      terms: 'Review the terms and conditions governing the use of PDFConverter online services.',
    };
    const title = translate(locale, label) + ' - PDFConverter';
    const description = translate(locale, descriptions[localizedSlug as keyof typeof descriptions]);
    return pageMetadata(locale, title, description, languages[locale], languages);
  }
  const canonicalSlug = getCanonicalSlugFromLocalized(localizedSlug, locale);
  if (!canonicalSlug || !Object.hasOwn(TOOLS_REGISTRY, canonicalSlug)) return {};

  const tool = TOOLS_REGISTRY[canonicalSlug];
  const dict = DICTIONARIES[locale];
  const toolContent = dict.tools[canonicalSlug];

  const title = toolContent?.title || `${tool.name} - PDFConverter`;
  const description = toolContent?.description || tool.description;
  const hreflang = generateHreflangAlternates(canonicalSlug);

  return pageMetadata(locale, title, description, hreflang.languages[locale], hreflang.languages);
}

export default async function LocalizedToolPage({
  params,
}: {
  params: Promise<{ toolSlug: string; localizedSlug: string }>;
}) {
  const t = (value: string) => translate(locale, value);

  const { toolSlug, localizedSlug } = await params;
  const locale = toolSlug as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  const isRTL = LOCALES_CONFIG[locale]?.dir === 'rtl';
  if (localizedSlug === 'contact') return <ContactPage />;
  if (localizedSlug === 'privacy') return <PrivacyPage />;
  if (localizedSlug === 'terms') return <TermsPage />;

  const canonicalSlug = getCanonicalSlugFromLocalized(localizedSlug, locale);
  if (!canonicalSlug || !Object.hasOwn(TOOLS_REGISTRY, canonicalSlug)) {
    notFound();
  }

  const tool = TOOLS_REGISTRY[canonicalSlug];
  const dict = DICTIONARIES[locale];
  const toolContent = dict.tools[canonicalSlug];

  const { stats, reviews } = await getPublicReviewData(tool.slug);

  const breadcrumb = <Breadcrumbs locale={locale} centered trail={toolTrail(locale, tool)} />;
  const guideLinks = <LocalizedGuideLinks locale={locale} toolSlug={tool.slug} />;
  const Utility = canonicalSlug === 'image-converter' ? ImageConverterClient : canonicalSlug === 'view-documents-online' ? DocumentViewerClient : canonicalSlug === 'markdown-editor' ? MarkdownEditorClient : null;
  if (Utility) return <><ReviewSchema toolName={t(toolContent.h1)} toolDescription={t(toolContent.description)} toolSlug={canonicalSlug} stats={stats} reviews={reviews} /><Utility initialStats={stats} initialReviews={reviews} breadcrumb={breadcrumb} guideLinks={guideLinks} /></>;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <ReviewSchema
        toolName={t(toolContent?.h1 || tool.name)}
        toolDescription={t(toolContent?.description || tool.description)}
        toolSlug={canonicalSlug}
        stats={stats}
        reviews={reviews}
      />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        {breadcrumb}
        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">
              {t(stats.ratingValue.toFixed(1).replace('.', ','))}
            </span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({t(stats.reviewCount.toLocaleString())})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">{t(dict.common.freeBadge.split('•')[0].trim())}</span>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t(toolContent?.h1 || tool.name)}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t(toolContent?.description || tool.description)}
        </p>

        <ConverterWidget tool={tool} />
        {guideLinks}

        {toolContent?.faqs && toolContent.faqs.length > 0 && (
          <section className={`text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8 ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              {t(dict.common.faqTitle)}
            </h2>
            <div className="space-y-4">
              {toolContent.faqs.map((faq: { q: string; a: string }, i: number) => (
                <div key={i} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    {t(faq.q)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t(faq.a)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewSection
          itemSlug={canonicalSlug}
          toolName={t(toolContent?.h1 || tool.name)}
          initialStats={stats}
          initialReviews={reviews}
        />
      </div>
    </div>
  );
}
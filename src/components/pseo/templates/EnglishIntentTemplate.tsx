import { pageMetadata } from '@/config/page-metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import type { EnglishIntentPage } from '@/config/english-pseo-content';
import ConverterWidget from '@/components/ConverterWidget';
import ImageConverterClient from '@/app/image-converter/ImageConverterClient';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import EnglishIntentLinks from '@/components/pseo/EnglishIntentLinks';
import { getPseoLanguageAlternates } from '@/config/pseo-publication';
import { getToolContent } from '@/config/tool-content';

const SITE = 'https://www.pdfconverter.space';
export function englishIntentMetadata(page: EnglishIntentPage): Metadata {
  const canonical = SITE + '/p/' + page.slug;
  return {
    ...pageMetadata('en', page.title, page.description, canonical, getPseoLanguageAlternates('/p/' + page.slug)),
    robots: { index: true, follow: true },
  };
}

export default async function EnglishIntentTemplate({ page }: { page: EnglishIntentPage }) {
  const tool = TOOLS_REGISTRY[page.toolSlug];
  const categoryLabel = tool.category === 'utility' ? 'Utilities & Viewers' : 'Document Tools';
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: categoryLabel, path: '/category/' + tool.category },
    { label: tool.name, path: '/' + tool.slug },
    { label: page.label, path: '/p/' + page.slug },
  ];
  // A review outage must not hide a working converter or its instructions.
  const reviewData = await getPublicReviewData(tool.slug);
  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.label, item: SITE + crumb.path })),
  };
  const webPage = {
    '@context': 'https://schema.org', '@type': 'WebPage',
    '@id': SITE + '/p/' + page.slug + '#webpage', url: SITE + '/p/' + page.slug,
    name: page.h1, description: page.description, inLanguage: 'en',
    mainEntity: { '@id': SITE + '/' + tool.slug + '#software' },
  };
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage).replace(/</g, '\\u003c') }} />
      <ReviewSchema toolName={tool.name} toolDescription={getToolContent(tool, 'en').description} toolSlug={tool.slug} stats={reviewData.stats} reviews={reviewData.reviews} />
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <nav className="text-xs text-slate-400 flex flex-wrap justify-center items-center gap-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => <span key={crumb.path} className="inline-flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page" className="text-slate-600 dark:text-slate-300">{crumb.label}</span> : <Link href={crumb.path} className="hover:underline">{crumb.label}</Link>}</span>)}
        </nav>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{page.h1}</h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">{page.intro}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2 text-left">
          {page.facts.map(fact => <div key={fact.label} className="p-2.5 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{fact.label}</span><span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{fact.value}</span></div>)}
        </div>
        <div className="pt-2">
          {page.widget === 'images' ? <ImageConverterClient embedded initialFormat={page.initialFormat} /> : <ConverterWidget tool={tool} />}
        </div>
        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">How to complete this workflow</h2>
          <ol className="grid gap-3 mb-8">
            {page.steps.map((step, index) => <li key={step.title} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5"><span className="w-7 h-7 rounded-lg bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center shrink-0" aria-hidden="true">{index + 1}</span><div><h3 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.text}</p></div></li>)}
          </ol>
          {page.comparison && <div className="overflow-x-auto mb-8"><table className="w-full text-xs text-left border-collapse"><caption className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Format capabilities and this converter’s outputs</caption><thead><tr>{['Format', 'Useful for', 'Transparency', 'Output here'].map(label => <th key={label} scope="col" className="p-3 border border-slate-200 dark:border-slate-800">{label}</th>)}</tr></thead><tbody>{page.comparison.map(row => <tr key={row.format}><th scope="row" className="p-3 border border-slate-200 dark:border-slate-800">{row.format}</th><td className="p-3 border border-slate-200 dark:border-slate-800">{row.usefulFor}</td><td className="p-3 border border-slate-200 dark:border-slate-800">{row.transparency}</td><td className="p-3 border border-slate-200 dark:border-slate-800">{row.output}</td></tr>)}</tbody></table></div>}
          {page.sections.map(section => <section key={section.heading} className="mb-8"><h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">{section.heading}</h2>{section.paragraphs.map(text => <p key={text} className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{text}</p>)}</section>)}
          <section><h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Frequently Asked Questions</h2><div className="space-y-4">{page.faqs.map(faq => <div key={faq.q} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800"><h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{faq.q}</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{faq.a}</p></div>)}</div></section>
        </section>
        <EnglishIntentLinks toolSlug={tool.slug} exclude={page.slug} />
        {page.relatedTools.length > 0 && <nav className="flex flex-wrap justify-center gap-3 text-xs" aria-label="Related tools">{page.relatedTools.map(slug => <Link key={slug} href={'/' + slug} className="text-[#FF2E54] hover:underline">{TOOLS_REGISTRY[slug].name}</Link>)}</nav>}
        <ReviewSection itemSlug={tool.slug} toolName={tool.name} initialStats={reviewData.stats} initialReviews={reviewData.reviews} />
      </div>
    </main>
  );
}

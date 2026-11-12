import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { pageMetadata } from '@/config/page-metadata';
import { generateHreflangAlternates } from '@/config/i18n-registry';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
export const dynamic = 'force-dynamic';
// src/app/markdown-editor/page.tsx
import { Metadata } from 'next';
import MarkdownEditorClient from './MarkdownEditorClient';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import ReviewSchema from '@/components/reviews/ReviewSchema';

export const revalidate = 60;

const languages = generateHreflangAlternates('markdown-editor').languages;
export const metadata: Metadata = pageMetadata('en',
  'Live Markdown Editor - Free Online Editor & Preview | PDFConverter',
  'Edit Markdown text in your browser, view it alongside the editor, and download an .md file.',
  languages.en, languages,
);

export default async function MarkdownEditorPage() {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);

  const { stats, reviews } = await getPublicReviewData('markdown-editor');

  return (
    <>
      <ReviewSchema
        toolName={t("Markdown Editor")}
        toolDescription={t("Interactive browser-based live Markdown editor and previewer with real-time split screen.")}
        toolSlug="markdown-editor"
        stats={stats}
        reviews={reviews}
      />
      <MarkdownEditorClient initialStats={stats} initialReviews={reviews} breadcrumb={<Breadcrumbs locale={locale} centered trail={toolTrail(locale, TOOLS_REGISTRY['markdown-editor'])} />} />
    </>
  );
}
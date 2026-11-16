import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { pageMetadata } from '@/config/page-metadata';
import { generateHreflangAlternates } from '@/config/i18n-registry';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
export const dynamic = 'force-dynamic';
// src/app/view-documents-online/page.tsx
import { Metadata } from 'next';
import DocumentViewerClient from './DocumentViewerClient';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import ReviewSchema from '@/components/reviews/ReviewSchema';

export const revalidate = 60;

const languages = generateHreflangAlternates('view-documents-online').languages;
export const metadata: Metadata = pageMetadata('en',
  'View Documents Online - Free Document Viewer | PDFConverter',
  'Preview supported PDF, Office, CSV and image files in your browser.',
  languages.en, languages,
);

export default async function ViewDocumentsOnlinePage() {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);

  const { stats, reviews } = await getPublicReviewData('view-documents-online');

  return (
    <>
      <ReviewSchema
        toolName={t("View Documents Online")}
        toolDescription={t("Open and preview PDF, Word DOCX, Excel XLSX, PPTX, CSV, and image files directly in your browser without software.")}
        toolSlug="view-documents-online"
        stats={stats}
        reviews={reviews}
      />
      <DocumentViewerClient initialStats={stats} initialReviews={reviews} breadcrumb={<Breadcrumbs locale={locale} centered trail={toolTrail(locale, TOOLS_REGISTRY['view-documents-online'])} />} />
    </>
  );
}
import Breadcrumbs, { toolTrail } from '@/components/Breadcrumbs';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { pageMetadata } from '@/config/page-metadata';
import { generateHreflangAlternates } from '@/config/i18n-registry';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
export const dynamic = 'force-dynamic';
// src/app/image-converter/page.tsx
import { Metadata } from 'next';
import ImageConverterClient from './ImageConverterClient';
import { getPublicReviewData } from '@/core/reviews/public-review-data';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import EnglishIntentLinks from '@/components/pseo/EnglishIntentLinks';

export const revalidate = 60;

const languages = generateHreflangAlternates('image-converter').languages;
export const metadata: Metadata = pageMetadata('en',
  'Image Converter - Batch Convert Images Online Free | PDFConverter',
  'Convert a batch of images in your browser and download the results individually or as a ZIP. Format support varies.',
  languages.en, languages,
);

export default async function ImageConverterPage() {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);

  const { stats, reviews } = await getPublicReviewData('image-converter');

  return (
    <>
      <ReviewSchema
        toolName={t("Image Converter")}
        toolDescription={t("Universal multi-format bulk image converter. Convert JPG, PNG, WebP, GIF, BMP, TIFF, and ICO directly in your browser.")}
        toolSlug="image-converter"
        stats={stats}
        reviews={reviews}
      />
      <ImageConverterClient initialStats={stats} initialReviews={reviews} breadcrumb={<Breadcrumbs locale={locale} centered trail={toolTrail(locale, TOOLS_REGISTRY['image-converter'])} />} guideLinks={locale === 'en' ? <EnglishIntentLinks toolSlug="image-converter" /> : undefined} />
    </>
  );
}

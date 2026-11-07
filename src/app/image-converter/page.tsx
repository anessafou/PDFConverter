// src/app/image-converter/page.tsx
import { Metadata } from 'next';
import ImageConverterClient from './ImageConverterClient';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import ReviewSchema from '@/components/reviews/ReviewSchema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Image Converter - Batch Convert Images Online Free | PDFConverter',
  description: 'Convert JPG, PNG, WebP, GIF, BMP, TIFF, and ICO images online in batch. In-browser processing with no account or installation required.',
  alternates: {
    canonical: 'https://www.pdfconverter.space/image-converter',
  },
};

export default async function ImageConverterPage() {
  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats('image-converter'),
    reviewsRepository.getPublishedReviews('image-converter', { limit: 20 }),
  ]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.pdfconverter.space',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Image Converter',
        item: 'https://www.pdfconverter.space/image-converter',
      },
    ],
  };

  const safeBreadcrumbJson = JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeBreadcrumbJson }}
      />
      <ReviewSchema
        toolName="Image Converter"
        toolDescription="Universal multi-format bulk image converter. Convert JPG, PNG, WebP, GIF, BMP, TIFF, and ICO directly in your browser."
        toolSlug="image-converter"
        stats={stats}
        reviews={reviews}
      />
      <ImageConverterClient initialStats={stats} initialReviews={reviews} />
    </>
  );
}
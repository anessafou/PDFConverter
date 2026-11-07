// src/app/view-documents-online/page.tsx
import { Metadata } from 'next';
import DocumentViewerClient from './DocumentViewerClient';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import ReviewSchema from '@/components/reviews/ReviewSchema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'View Documents Online - Free Document Viewer | PDFConverter',
  description: 'Open and preview PDF, Word DOCX, Excel XLSX, PPTX, CSV, and image files directly in your browser without software installation. 100% private and free.',
  alternates: {
    canonical: 'https://www.pdfconverter.space/view-documents-online',
  },
};

export default async function ViewDocumentsOnlinePage() {
  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats('view-documents-online'),
    reviewsRepository.getPublishedReviews('view-documents-online', { limit: 20 }),
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
        name: 'View Documents Online',
        item: 'https://www.pdfconverter.space/view-documents-online',
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
        toolName="View Documents Online"
        toolDescription="Open and preview PDF, Word DOCX, Excel XLSX, PPTX, CSV, and image files directly in your browser without software."
        toolSlug="view-documents-online"
        stats={stats}
        reviews={reviews}
      />
      <DocumentViewerClient initialStats={stats} initialReviews={reviews} />
    </>
  );
}
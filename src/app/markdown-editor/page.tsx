// src/app/markdown-editor/page.tsx
import { Metadata } from 'next';
import MarkdownEditorClient from './MarkdownEditorClient';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import ReviewSchema from '@/components/reviews/ReviewSchema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Live Markdown Editor - Free Online Editor & Preview | PDFConverter',
  description: 'Edit, format, and preview Markdown notes in real time directly in your browser. Live split-screen preview and one-click .md export with zero sign-up.',
  alternates: {
    canonical: 'https://www.pdfconverter.space/markdown-editor',
  },
};

export default async function MarkdownEditorPage() {
  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats('markdown-editor'),
    reviewsRepository.getPublishedReviews('markdown-editor', { limit: 20 }),
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
        name: 'Markdown Editor',
        item: 'https://www.pdfconverter.space/markdown-editor',
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
        toolName="Markdown Editor"
        toolDescription="Interactive browser-based live Markdown editor and previewer with real-time split screen."
        toolSlug="markdown-editor"
        stats={stats}
        reviews={reviews}
      />
      <MarkdownEditorClient initialStats={stats} initialReviews={reviews} />
    </>
  );
}
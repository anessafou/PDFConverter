// src/app/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import HomeTemplate from '@/components/pseo/templates/HomeTemplate';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'PDFConverter - Free Online PDF & Document Suite',
  description: 'Convert, compress, and edit PDF, Office, and image files online for free. In-browser processing with no account required.',
  alternates: {
    canonical: 'https://www.pdfconverter.space',
  },
};

export default async function HomePage() {
  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats('site'),
    reviewsRepository.getPublishedReviews('site', { limit: 50 }),
  ]);

  return <HomeTemplate locale="en" stats={stats} reviews={reviews} />;
}
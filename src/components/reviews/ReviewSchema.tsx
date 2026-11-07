// src/components/reviews/ReviewSchema.tsx
import React from 'react';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface ReviewSchemaProps {
  toolName: string;
  toolDescription: string;
  toolSlug: string;
  stats: AggregateRatingStats;
  reviews: Review[];
}

export default function ReviewSchema({
  toolName,
  toolDescription,
  toolSlug,
  stats,
  reviews,
}: ReviewSchemaProps) {
  // Omit schema completely if no published reviews exist
  if (!stats || stats.reviewCount === 0) {
    return null;
  }

  const canonicalUrl =
    !toolSlug || toolSlug === 'site'
      ? 'https://www.pdfconverter.space'
      : `https://www.pdfconverter.space/${toolSlug}`;

  // Filter for genuine, non-empty, deduplicated written reviews matching visible UI
  const seen = new Set<string>();
  const validWrittenReviews: Review[] = [];

  for (const r of reviews) {
    if (typeof r.comment === 'string' && r.comment.trim().length > 0) {
      const key = `${r.authorName.trim().toLowerCase()}|${r.comment.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        validWrittenReviews.push(r);
      }
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#software`,
    name: `${toolName} - PDFConverter`,
    description: toolDescription,
    url: canonicalUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires HTML5 support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.ratingValue.toFixed(1),
      ratingCount: stats.ratingCount,
      reviewCount: stats.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    // Strictly map visible reviews with genuine comment text
    review: validWrittenReviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.authorName,
      },
      datePublished: r.createdAt.split('T')[0],
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.comment,
    })),
  };

  // Safe serialization preventing script injection
  const safeJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
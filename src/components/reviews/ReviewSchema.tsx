// src/components/reviews/ReviewSchema.tsx
import React from 'react';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface ReviewSchemaProps {
  toolName: string;
  toolDescription: string;
  toolSlug: string;
  stats?: AggregateRatingStats | null;
  reviews?: Review[];
}

export default function ReviewSchema({
  toolName,
  toolDescription,
  toolSlug,
  stats,
  reviews = [],
}: ReviewSchemaProps) {
  const canonicalUrl =
    !toolSlug || toolSlug === 'site'
      ? 'https://www.pdfconverter.space'
      : `https://www.pdfconverter.space/${toolSlug}`;

  // Base SoftwareApplication schema
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#software`,
    name: `${toolName} - PDFConverter`,
    description: toolDescription,
    url: canonicalUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires modern web browser with HTML5 support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Only emit AggregateRating if genuine user reviews exist in the database
  if (stats && stats.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.ratingValue.toFixed(1),
      ratingCount: stats.ratingCount,
      reviewCount: stats.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };

    const validComments = reviews.filter((r) => r.comment && r.comment.trim().length > 0);
    if (validComments.length > 0) {
      schema.review = validComments.slice(0, 5).map((r) => ({
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
      }));
    }
  }

  const safeJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
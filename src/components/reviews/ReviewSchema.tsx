import { requestLocale } from '@/locales/server';
import { localizePath } from '@/locales/routing';
import { translate } from '@/locales/translate';
// src/components/reviews/ReviewSchema.tsx
import React from 'react';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';
import JsonLd from '@/components/JsonLd';
import { writtenReviews } from '@/core/reviews/written-reviews';
import type { Locale } from '@/config/i18n-registry';

interface ReviewSchemaProps {
  toolName: string;
  toolDescription: string;
  toolSlug: string;
  stats?: AggregateRatingStats | null;
  reviews?: Review[];
}

export function buildReviewSchema(locale: Locale, {
  toolName,
  toolDescription,
  toolSlug,
  stats,
  reviews = [],
}: ReviewSchemaProps) {
  const canonicalUrl = 'https://www.pdfconverter.space' + localizePath(!toolSlug || toolSlug === 'site' ? '/' : '/' + toolSlug, locale);

  // Base SoftwareApplication schema
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#software`,
    name: `${toolName} - PDFConverter`,
    description: translate(locale, toolDescription),
    inLanguage: locale,
    url: canonicalUrl,
    applicationCategory: 'BusinessApplication',
    browserRequirements: translate(locale, 'Requires modern web browser with HTML5 support'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Only emit AggregateRating if genuine user reviews exist in the database
  const distribution = stats?.distribution;
  const distributionIsValid = Boolean(distribution &&
    [distribution[1], distribution[2], distribution[3], distribution[4], distribution[5]]
      .every(count => Number.isInteger(count) && count >= 0) &&
    [distribution[1], distribution[2], distribution[3], distribution[4], distribution[5]]
      .reduce((sum, count) => sum + count, 0) === stats?.reviewCount);
  if (stats?.itemSlug === toolSlug && Number.isInteger(stats.ratingCount) && stats.ratingCount > 0 &&
      Number.isInteger(stats.reviewCount) && stats.reviewCount > 0 &&
      stats.ratingValue >= 1 && stats.ratingValue <= 5 && distributionIsValid) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.ratingValue.toFixed(1),
      ratingCount: stats.ratingCount,
      reviewCount: stats.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };

    const validComments = writtenReviews(reviews).filter(review =>
      review.status === 'published' && review.itemSlug === toolSlug &&
      review.comment?.trim() && review.authorName.trim() &&
      Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 &&
      Number.isFinite(Date.parse(review.createdAt)),
    );
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

  return schema;
}

export default async function ReviewSchema(props: ReviewSchemaProps) {
  return <JsonLd data={buildReviewSchema(await requestLocale(), props)} />;
}

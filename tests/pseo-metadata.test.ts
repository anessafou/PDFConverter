import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localizedPseoMetadata, localizedPseoHeading } from '../src/config/localized-pseo-metadata';
import { getPublishedPseoPages, getPseoLanguageAlternates } from '../src/config/pseo-publication';
import { buildReviewSchema } from '../src/components/reviews/ReviewSchema';
import type { AggregateRatingStats, Review } from '../src/core/reviews/reviews.interface';

test('all localized pSEO pages have unique page copy and matching social and canonical URLs', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const page of getPublishedPseoPages()) {
    if (page.locale === 'en' || page.intent.kind !== 'platform') continue;
    const metadata = localizedPseoMetadata(page);
    const heading = localizedPseoHeading(page.locale, page.toolSlug, page.intent.modifier);
    assert.equal(metadata.title, heading + ' | PDFConverter');
    assert.ok(metadata.description?.startsWith(heading));
    assert.equal(metadata.openGraph?.title, metadata.title);
    assert.equal(metadata.openGraph?.description, metadata.description);
    assert.equal(metadata.openGraph?.url, 'https://www.pdfconverter.space' + page.path);
    assert.equal(metadata.alternates?.canonical, metadata.openGraph?.url);
    assert.deepEqual(metadata.alternates?.languages, getPseoLanguageAlternates(page.path));
    titles.add(metadata.title);
    descriptions.add(metadata.description);
  }
  assert.equal(titles.size, 1328);
  assert.equal(descriptions.size, 1328);
});

test('review markup uses matching published reviews and omits unavailable or unrelated ratings', () => {
  const props = { toolName: 'PDF in Word umwandeln', toolDescription: 'Konvertierung', toolSlug: 'pdf-to-word' };
  assert.equal(buildReviewSchema('de', props).aggregateRating, undefined);
  const stats: AggregateRatingStats = {
    itemSlug: props.toolSlug, ratingValue: 4, reviewCount: 1, ratingCount: 1,
    bestRating: 5, worstRating: 1, distribution: { 5: 0, 4: 1, 3: 0, 2: 0, 1: 0 },
  };
  const review: Review = {
    id: 'published', itemSlug: props.toolSlug, authorName: 'Example reviewer', rating: 4,
    comment: 'Example comment', status: 'published', helpfulCount: 0, ipHash: '',
    createdAt: '2026-11-10T10:00:00Z', updatedAt: '2026-11-10T10:00:00Z',
  };
  const schema = buildReviewSchema('de', { ...props, stats, reviews: [
    review, { ...review, id: 'duplicate' },
    { ...review, id: 'pending', status: 'pending', comment: 'Pending comment' },
    { ...review, id: 'other', itemSlug: 'word-to-pdf', comment: 'Unrelated comment' },
  ] });
  assert.equal(schema.inLanguage, 'de');
  assert.deepEqual(schema.aggregateRating, {
    '@type': 'AggregateRating', ratingValue: '4.0', ratingCount: 1, reviewCount: 1,
    bestRating: '5', worstRating: '1',
  });
  assert.equal((schema.review as unknown[]).length, 1);
  assert.equal(buildReviewSchema('de', { ...props, stats: { ...stats, itemSlug: 'site' } }).aggregateRating, undefined);
  assert.equal(buildReviewSchema('de', { ...props, stats: { ...stats, distribution: { ...stats.distribution, 5: 3 } } }).aggregateRating, undefined);
});

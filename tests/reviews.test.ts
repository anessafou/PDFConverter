import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { ReviewsRepository } from '../src/core/reviews/reviews-repository';
import { getPublicReviewData } from '../src/core/reviews/public-review-data';
import type { AggregateRatingStats, IReviewsRepository } from '../src/core/reviews/reviews.interface';

const payload = (rating: number) => ({ itemSlug: 'pdf-to-word', authorName: 'Test user', rating, comment: 'A useful document tool.' });
test('PostgreSQL reviews share creation, moderation, voting, filters, stats and deletion', async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile('scripts/schema-postgres.sql', 'utf8'));
    await db.exec(await readFile('scripts/migrate-reviews.sql', 'utf8'));
    await db.exec(await readFile('scripts/migrate-reviews.sql', 'utf8'));
    const repository = new ReviewsRepository({ query: (sql: string, params: unknown[]) => db.query(sql, params) } as unknown as Pool);
    const low = await repository.createReview(payload(1), 'hash-a');
    const high = await repository.createReview(payload(5), 'hash-b');
    assert.equal((await repository.getAllReviewsForAdmin()).length, 2);
    assert.deepEqual((await repository.getPublishedReviews('pdf-to-word', { starFilter: 5 })).map(r => r.id), [high.id]);
    assert.deepEqual((await repository.getPublishedReviews('pdf-to-word', { sortBy: 'lowest' })).map(r => r.rating), [1, 5]);
    assert.deepEqual((await repository.getPublishedReviews('pdf-to-word', { sortBy: 'highest', limit: 1 })).map(r => r.id), [high.id]);
    assert.equal(await repository.voteHelpful(high.id), 1);
    assert.equal(await repository.voteHelpful(high.id), 2);
    assert.equal((await repository.getAllReviewsForAdmin()).find(r => r.id === high.id)?.helpfulCount, 2);
    assert.equal((await repository.updateReviewStatus(low.id, 'rejected'))?.status, 'rejected');
    assert.equal((await repository.getPublishedReviews('pdf-to-word')).length, 1);
    assert.equal(await repository.voteHelpful(low.id), null);
    assert.equal((await repository.getAllReviewsForAdmin('rejected'))[0].id, low.id);
    assert.equal((await repository.getAggregateStats('site')).ratingValue, 5);
    assert.equal(await repository.deleteReview(high.id), true);
    assert.equal(await repository.deleteReview(high.id), false);
    assert.equal((await repository.getPublishedReviews('site')).length, 0);
    assert.equal((await repository.getAggregateStats('site')).reviewCount, 0);
    for (let i = 0; i < 5; i++) assert.equal(await repository.checkRateLimit('limit-test', 5, 3600), true);
    assert.equal(await repository.checkRateLimit('limit-test', 5, 3600), false);
  } finally { await db.close(); }
});

test('configured database failures reject instead of falling back or disabling rate limits', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'review-outage-'));
  try {
    const repository = new ReviewsRepository({ query: async () => { throw new Error('database offline'); } } as unknown as Pool, directory);
    await assert.rejects(repository.createReview(payload(5), 'hash'), /database offline/);
    await assert.rejects(repository.getPublishedReviews('site'), /database offline/);
    await assert.rejects(repository.checkRateLimit('key', 5, 3600), /database offline/);
    await assert.rejects(access(path.join(directory, 'reviews.json')));
  } finally { await rm(directory, { recursive: true }); }
});

test('public page review data degrades safely on outages, timeouts and malformed responses', async () => {
  const validStats: AggregateRatingStats = {
    itemSlug: 'pdf-to-word', ratingValue: 5, reviewCount: 1, ratingCount: 1,
    bestRating: 5, worstRating: 1, distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
  const validReview = {
    id: 'review-1', itemSlug: 'pdf-to-word', authorName: 'Reader', rating: 5,
    status: 'published' as const, helpfulCount: 0, ipHash: 'private',
    createdAt: '2026-11-10T10:00:00.000Z', updatedAt: '2026-11-10T10:00:00.000Z',
  };
  const repository = (stats: unknown, reviews: unknown): IReviewsRepository => ({
    getAggregateStats: async () => stats as AggregateRatingStats,
    getPublishedReviews: async () => reviews as never[],
  } as unknown as IReviewsRepository);

  assert.deepEqual(await getPublicReviewData('pdf-to-word', 20, repository(validStats, [validReview])), {
    stats: validStats, reviews: [validReview],
  });
  assert.deepEqual(await getPublicReviewData('pdf-to-word', 20, repository(validStats, [])), {
    stats: validStats, reviews: [],
  });
  for (const failing of [
    { getAggregateStats: async () => { throw Error('database offline'); }, getPublishedReviews: async () => [] },
    { getAggregateStats: async () => new Promise(() => {}), getPublishedReviews: async () => [] },
    { getAggregateStats: async () => ({ ...validStats, ratingValue: NaN }), getPublishedReviews: async () => [validReview] },
    { getAggregateStats: async () => validStats, getPublishedReviews: async () => [{ ...validReview, rating: 12 }] },
    { getAggregateStats: async () => validStats, getPublishedReviews: async () => null },
  ]) {
    const result = await getPublicReviewData('pdf-to-word', 20, failing as unknown as IReviewsRepository, 10);
    assert.deepEqual(result, { stats: null, reviews: [] });
  }
});

test('development file storage filters, sorts and persists across repository instances', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'review-local-'));
  try {
    const repository = new ReviewsRepository(null, directory);
    await repository.createReview(payload(1), 'hash-a');
    await repository.createReview(payload(5), 'hash-b');
    const reopened = new ReviewsRepository(null, directory);
    assert.deepEqual((await reopened.getPublishedReviews('site', { starFilter: 5 })).map(r => r.rating), [5]);
    assert.deepEqual((await reopened.getPublishedReviews('site', { sortBy: 'lowest' })).map(r => r.rating), [1, 5]);
    assert.equal((await reopened.getAggregateStats('site')).reviewCount, 2);
    await assert.rejects(reopened.getPublishedReviews('site', { starFilter: 0 }), /Invalid star/);
  } finally { await rm(directory, { recursive: true }); }
});

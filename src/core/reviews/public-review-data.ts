import type { AggregateRatingStats, Review } from './reviews.interface';
import { reviewsRepository } from './reviews-repository';
import type { IReviewsRepository } from './reviews.interface';

export interface PublicReviewData {
  stats: AggregateRatingStats | null;
  reviews: Review[];
}

const emptyReviewData: PublicReviewData = { stats: null, reviews: [] };

function isReview(value: unknown, itemSlug: string): value is Review {
  if (!value || typeof value !== 'object') return false;
  const review = value as Partial<Review>;
  return review.itemSlug === itemSlug && typeof review.id === 'string' &&
    typeof review.authorName === 'string' && Number.isInteger(review.rating) &&
    Number(review.rating) >= 1 && Number(review.rating) <= 5 &&
    ['pending', 'published', 'rejected'].includes(String(review.status)) &&
    typeof review.helpfulCount === 'number' && Number.isInteger(review.helpfulCount) &&
    typeof review.ipHash === 'string' && Number.isFinite(Date.parse(String(review.createdAt))) &&
    Number.isFinite(Date.parse(String(review.updatedAt)));
}

function isAggregateStats(value: unknown, itemSlug: string): value is AggregateRatingStats {
  if (!value || typeof value !== 'object') return false;
  const stats = value as Partial<AggregateRatingStats>;
  const distribution = stats.distribution;
  if (stats.itemSlug !== itemSlug || !Number.isInteger(stats.reviewCount) ||
      !Number.isInteger(stats.ratingCount) || stats.reviewCount! < 0 ||
      stats.ratingCount !== stats.reviewCount || !distribution) return false;

  const buckets = [distribution[1], distribution[2], distribution[3], distribution[4], distribution[5]];
  if (!buckets.every(count => Number.isInteger(count) && count >= 0) ||
      buckets.reduce((sum, count) => sum + count, 0) !== stats.reviewCount) return false;
  return stats.reviewCount === 0
    ? stats.ratingValue === 0
    : Number.isFinite(stats.ratingValue) && stats.ratingValue! >= 1 && stats.ratingValue! <= 5;
}

/** Public rendering must remain available when optional review storage is unavailable. */
export async function getPublicReviewData(
  itemSlug: string,
  limit = 20,
  repository: Pick<IReviewsRepository, 'getAggregateStats' | 'getPublishedReviews'> = reviewsRepository,
  timeoutMs = 4500,
): Promise<PublicReviewData> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const [stats, reviews] = await Promise.race([
      Promise.all([
        repository.getAggregateStats(itemSlug),
        repository.getPublishedReviews(itemSlug, { limit }),
      ]),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Review data timed out.')), timeoutMs);
      }),
    ]);
    if (!isAggregateStats(stats, itemSlug) || !Array.isArray(reviews) ||
        !reviews.every(review => isReview(review, itemSlug))) return emptyReviewData;
    return { stats, reviews };
  } catch {
    return emptyReviewData;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

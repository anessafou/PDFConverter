import type { Review } from './reviews.interface';

export function writtenReviews(reviews: Review[]): Review[] {
  const seen = new Set<string>();
  return reviews.filter(review => {
    const comment = review.comment?.trim();
    if (!comment) return false;
    const key = JSON.stringify([review.authorName.trim().toLowerCase(), comment.toLowerCase()]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

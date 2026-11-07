export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface Review {
  id: string;
  itemSlug: string; // Must match an existing tool slug in TOOLS_REGISTRY or 'site'
  authorName: string;
  rating: number; // Integer between 1 and 5
  title?: string;
  comment?: string;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
  ipHash: string;
}

export interface AggregateRatingStats {
  itemSlug: string;
  ratingValue: number; // e.g. 4.9
  reviewCount: number; // Total published reviews
  ratingCount: number;
  bestRating: 5;
  worstRating: 1;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewSubmissionPayload {
  itemSlug: string;
  authorName: string;
  rating: number;
  title?: string;
  comment?: string;
  honeypot?: string;
}

export interface IReviewsRepository {
  createReview(payload: ReviewSubmissionPayload, ipHash: string): Promise<Review>;
  getPublishedReviews(
    itemSlug: string,
    options?: { starFilter?: number; sortBy?: 'newest' | 'highest' | 'lowest'; limit?: number }
  ): Promise<Review[]>;
  getAggregateStats(itemSlug: string): Promise<AggregateRatingStats>;
  voteHelpful(id: string): Promise<number | null>;
  getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]>;
  updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;
  checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}
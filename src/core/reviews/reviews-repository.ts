// src/core/reviews/reviews-repository.ts
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import {
  Review,
  ReviewStatus,
  AggregateRatingStats,
  ReviewSubmissionPayload,
  IReviewsRepository,
} from './reviews.interface';

let pgPool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000,
  });
}

const DATA_DIR = path.join(process.cwd(), '.data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// In-memory runtime fallback for serverless read-only environments
let inMemoryReviews: Review[] = [];

function safeReadFileReviews(): Review[] {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      return JSON.parse(raw) as Review[];
    }
  } catch {
    // Fail silently on read-only serverless filesystems
  }
  return inMemoryReviews;
}

function safeWriteFileReviews(reviews: Review[]): void {
  inMemoryReviews = reviews;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch {
    // Fail gracefully in serverless/lambda environments
  }
}

export class ReviewsRepository implements IReviewsRepository {
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (pgPool) {
      try {
        const expireAt = new Date(Date.now() + windowSeconds * 1000);
        const result = await pgPool.query(
          `INSERT INTO rate_limits (key, points, expire_at)
           VALUES ($1, 1, $2)
           ON CONFLICT (key) DO UPDATE
           SET points = CASE WHEN rate_limits.expire_at < NOW() THEN 1 ELSE rate_limits.points + 1 END,
           expire_at = CASE WHEN rate_limits.expire_at < NOW() THEN $2 ELSE rate_limits.expire_at END
           RETURNING points`,
          [key, expireAt]
        );
        return result.rows[0].points <= limit;
      } catch {
        return true;
      }
    }
    return true;
  }

  async createReview(payload: ReviewSubmissionPayload, ipHash: string): Promise<Review> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nowIso = new Date().toISOString();
    const status: ReviewStatus = 'published';

    if (pgPool) {
      try {
        const query = `
          INSERT INTO reviews (id, item_slug, author_name, rating, title, comment, status, ip_hash, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
          RETURNING *;
        `;
        const res = await pgPool.query(query, [
          id, payload.itemSlug, payload.authorName, payload.rating,
          payload.title || null, payload.comment || null, status, ipHash, nowIso
        ]);
        const row = res.rows[0];
        return {
          id: row.id,
          itemSlug: row.item_slug,
          authorName: row.author_name,
          rating: Number(row.rating),
          title: row.title || undefined,
          comment: row.comment || undefined,
          status: row.status as ReviewStatus,
          helpfulCount: 0,
          createdAt: row.created_at.toISOString(),
          updatedAt: row.updated_at.toISOString(),
          ipHash: row.ip_hash,
        };
      } catch {
        // Fall through
      }
    }

    const all = safeReadFileReviews();
    const newReview: Review = {
      id,
      itemSlug: payload.itemSlug,
      authorName: payload.authorName,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      status,
      helpfulCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      ipHash,
    };
    all.unshift(newReview);
    safeWriteFileReviews(all);
    return newReview;
  }

  async getPublishedReviews(
    itemSlug: string,
    options?: { starFilter?: number; sortBy?: 'newest' | 'highest' | 'lowest'; limit?: number }
  ): Promise<Review[]> {
    const limit = options?.limit || 20;
    const isSiteWide = itemSlug === 'site' || !itemSlug;

    if (pgPool) {
      try {
        const query = isSiteWide
          ? `SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC LIMIT $1`
          : `SELECT * FROM reviews WHERE item_slug = $1 AND status = 'published' ORDER BY created_at DESC LIMIT $2`;
        const params = isSiteWide ? [limit] : [itemSlug, limit];
        const res = await pgPool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map((row) => ({
            id: row.id,
            itemSlug: row.item_slug,
            authorName: row.author_name,
            rating: Number(row.rating),
            title: row.title || undefined,
            comment: row.comment || undefined,
            status: row.status as ReviewStatus,
            helpfulCount: Number(row.helpful_count || 0),
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString(),
            ipHash: row.ip_hash,
          }));
        }
      } catch {
        // Fall through
      }
    }

    const all = safeReadFileReviews().filter((r) => {
      if (r.status !== 'published') return false;
      return isSiteWide ? true : r.itemSlug === itemSlug;
    });

    return all.slice(0, limit);
  }

  async getAggregateStats(itemSlug: string): Promise<AggregateRatingStats> {
    const isSiteWide = itemSlug === 'site' || !itemSlug;

    if (pgPool) {
      try {
        const statsQuery = await pgPool.query(
          isSiteWide
            ? `SELECT COUNT(*)::int as count, COALESCE(AVG(rating), 0)::float as avg_rating FROM reviews WHERE status = 'published'`
            : `SELECT COUNT(*)::int as count, COALESCE(AVG(rating), 0)::float as avg_rating FROM reviews WHERE item_slug = $1 AND status = 'published'`,
          isSiteWide ? [] : [itemSlug]
        );

        const count = statsQuery.rows[0]?.count || 0;
        if (count > 0) {
          const distQuery = await pgPool.query(
            isSiteWide
              ? `SELECT rating, COUNT(*)::int as count FROM reviews WHERE status = 'published' GROUP BY rating`
              : `SELECT rating, COUNT(*)::int as count FROM reviews WHERE item_slug = $1 AND status = 'published' GROUP BY rating`,
            isSiteWide ? [] : [itemSlug]
          );

          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          distQuery.rows.forEach((row) => {
            const star = Number(row.rating) as 1 | 2 | 3 | 4 | 5;
            if (distribution[star] !== undefined) distribution[star] = row.count;
          });

          return {
            itemSlug,
            ratingValue: parseFloat(statsQuery.rows[0].avg_rating.toFixed(1)),
            reviewCount: count,
            ratingCount: count,
            bestRating: 5,
            worstRating: 1,
            distribution,
          };
        }
      } catch {
        // Fall through
      }
    }

    const all = safeReadFileReviews().filter((r) => {
      if (r.status !== 'published') return false;
      return isSiteWide ? true : r.itemSlug === itemSlug;
    });

    if (all.length > 0) {
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;
      for (const r of all) {
        const star = Math.min(Math.max(Math.round(r.rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
        distribution[star]++;
        sum += r.rating;
      }
      return {
        itemSlug,
        ratingValue: parseFloat((sum / all.length).toFixed(1)),
        reviewCount: all.length,
        ratingCount: all.length,
        bestRating: 5,
        worstRating: 1,
        distribution,
      };
    }

    // Return clean zeroed-out stats when no user reviews exist
    return {
      itemSlug,
      ratingValue: 0,
      reviewCount: 0,
      ratingCount: 0,
      bestRating: 5,
      worstRating: 1,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  async voteHelpful(id: string): Promise<number | null> {
    const all = safeReadFileReviews();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx].helpfulCount = (all[idx].helpfulCount || 0) + 1;
    safeWriteFileReviews(all);
    return all[idx].helpfulCount;
  }

  async getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
    const all = safeReadFileReviews();
    return status ? all.filter((r) => r.status === status) : all;
  }

  async updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null> {
    const all = safeReadFileReviews();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx].status = status;
    all[idx].updatedAt = new Date().toISOString();
    safeWriteFileReviews(all);
    return all[idx];
  }

  async deleteReview(id: string): Promise<boolean> {
    const all = safeReadFileReviews();
    const filtered = all.filter((r) => r.id !== id);
    if (filtered.length === all.length) return false;
    safeWriteFileReviews(filtered);
    return true;
  }
}

export const reviewsRepository = new ReviewsRepository();
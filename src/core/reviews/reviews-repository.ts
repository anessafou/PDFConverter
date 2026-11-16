import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { Review, ReviewStatus, AggregateRatingStats, ReviewSubmissionPayload, IReviewsRepository } from './reviews.interface';

const pgPool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, connectionTimeoutMillis: 2500, query_timeout: 4000, idleTimeoutMillis: 30000,
}) : null;
pgPool?.on('error', () => console.error('Idle PostgreSQL connection error.'));

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id), itemSlug: String(row.item_slug), authorName: String(row.author_name),
    rating: Number(row.rating), title: row.title ? String(row.title) : undefined,
    comment: row.comment ? String(row.comment) : undefined, status: row.status as ReviewStatus,
    helpfulCount: Number(row.helpful_count || 0), ipHash: String(row.ip_hash),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export class ReviewsRepository implements IReviewsRepository {
  private readonly file: string;
  private readonly rateLimits = new Map<string, { points: number; expires: number }>();

  constructor(private readonly pool: Pool | null = pgPool, dataDir = path.join(process.cwd(), '.data')) {
    this.file = path.join(dataDir, 'reviews.json');
  }

  private readLocal(): Review[] {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required for review storage in production.');
    if (!fs.existsSync(this.file)) return [];
    return JSON.parse(fs.readFileSync(this.file, 'utf8')) as Review[];
  }

  private writeLocal(reviews: Review[]): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temporary = this.file + '.' + randomUUID() + '.tmp';
    try {
      fs.writeFileSync(temporary, JSON.stringify(reviews, null, 2), 'utf8');
      fs.renameSync(temporary, this.file);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (this.pool) {
      const result = await this.pool.query(
        'INSERT INTO rate_limits (key, points, expire_at) VALUES ($1, 1, $2) ' +
        'ON CONFLICT (key) DO UPDATE SET ' +
        'points = CASE WHEN rate_limits.expire_at <= NOW() THEN 1 ELSE rate_limits.points + 1 END, ' +
        'expire_at = CASE WHEN rate_limits.expire_at <= NOW() THEN $2 ELSE rate_limits.expire_at END RETURNING points',
        [key, new Date(Date.now() + windowSeconds * 1000)]
      );
      return result.rows[0].points <= limit;
    }
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required for rate limiting in production.');
    const now = Date.now();
    for (const [k, value] of this.rateLimits) if (value.expires <= now) this.rateLimits.delete(k);
    const entry = this.rateLimits.get(key) || { points: 0, expires: now + windowSeconds * 1000 };
    entry.points++;
    this.rateLimits.set(key, entry);
    return entry.points <= limit;
  }

  async createReview(payload: ReviewSubmissionPayload, ipHash: string): Promise<Review> {
    const review: Review = {
      id: 'rev_' + randomUUID(), ...payload, ipHash, status: 'published', helpfulCount: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    if (this.pool) {
      const result = await this.pool.query(
        'INSERT INTO reviews (id, item_slug, author_name, rating, title, comment, status, ip_hash, created_at, updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
        [review.id, review.itemSlug, review.authorName, review.rating, review.title || null,
          review.comment || null, review.status, ipHash, review.createdAt, review.updatedAt]
      );
      return mapReview(result.rows[0]);
    }
    const all = this.readLocal();
    all.unshift(review);
    this.writeLocal(all);
    return review;
  }

  async getPublishedReviews(itemSlug: string, options?: {
    starFilter?: number; sortBy?: 'newest' | 'highest' | 'lowest'; limit?: number;
  }): Promise<Review[]> {
    const limit = Math.min(100, Math.max(1, Math.floor(options?.limit || 20)));
    const star = options?.starFilter;
    if (star !== undefined && (!Number.isInteger(star) || star < 1 || star > 5)) throw new Error('Invalid star filter.');
    const sort = options?.sortBy || 'newest';
    if (!['newest', 'highest', 'lowest'].includes(sort)) throw new Error('Invalid sort order.');
    if (this.pool) {
      const params: unknown[] = [];
      let where = "status = 'published'";
      if (itemSlug && itemSlug !== 'site') { params.push(itemSlug); where += ' AND item_slug = $' + params.length; }
      if (star !== undefined) { params.push(star); where += ' AND rating = $' + params.length; }
      const order = sort === 'highest' ? 'rating DESC, created_at DESC, id DESC' :
        sort === 'lowest' ? 'rating ASC, created_at DESC, id DESC' : 'created_at DESC, id DESC';
      params.push(limit);
      const result = await this.pool.query('SELECT * FROM reviews WHERE ' + where + ' ORDER BY ' + order + ' LIMIT $' + params.length, params);
      return result.rows.map(mapReview);
    }
    return this.readLocal().filter(r => r.status === 'published' &&
      (!itemSlug || itemSlug === 'site' || r.itemSlug === itemSlug) && (star === undefined || r.rating === star))
      .sort((a, b) => (sort === 'highest' ? b.rating - a.rating : sort === 'lowest' ? a.rating - b.rating : 0) ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id)).slice(0, limit);
  }

  async getAggregateStats(itemSlug: string): Promise<AggregateRatingStats> {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (this.pool) {
      const site = !itemSlug || itemSlug === 'site';
      const result = await this.pool.query(
        "SELECT rating, COUNT(*)::int AS count FROM reviews WHERE status = 'published'" +
        (site ? '' : ' AND item_slug = $1') + ' GROUP BY rating', site ? [] : [itemSlug]
      );
      for (const row of result.rows) distribution[row.rating as 1|2|3|4|5] = Number(row.count);
    } else {
      for (const r of this.readLocal()) if (r.status === 'published' && (!itemSlug || itemSlug === 'site' || r.itemSlug === itemSlug)) {
        distribution[r.rating as 1|2|3|4|5]++;
      }
    }
    const count = Object.values(distribution).reduce((a, b) => a + b, 0);
    const sum = Object.entries(distribution).reduce((a, [star, n]) => a + Number(star) * n, 0);
    return { itemSlug, ratingValue: count ? Number((sum / count).toFixed(1)) : 0,
      reviewCount: count, ratingCount: count, bestRating: 5, worstRating: 1, distribution };
  }

  async voteHelpful(id: string): Promise<number | null> {
    if (this.pool) {
      const result = await this.pool.query("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 AND status = 'published' RETURNING helpful_count", [id]);
      return result.rows[0] ? Number(result.rows[0].helpful_count) : null;
    }
    const all = this.readLocal();
    const review = all.find(r => r.id === id && r.status === 'published');
    if (!review) return null;
    review.helpfulCount++;
    this.writeLocal(all);
    return review.helpfulCount;
  }

  async getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
    if (this.pool) {
      const result = await this.pool.query('SELECT * FROM reviews' + (status ? ' WHERE status = $1' : '') +
        ' ORDER BY created_at DESC, id DESC', status ? [status] : []);
      return result.rows.map(mapReview);
    }
    return this.readLocal().filter(r => !status || r.status === status).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  async updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null> {
    if (this.pool) {
      const result = await this.pool.query('UPDATE reviews SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *', [id, status]);
      return result.rows[0] ? mapReview(result.rows[0]) : null;
    }
    const all = this.readLocal();
    const review = all.find(r => r.id === id);
    if (!review) return null;
    review.status = status;
    review.updatedAt = new Date().toISOString();
    this.writeLocal(all);
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    if (this.pool) {
      const result = await this.pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    }
    const all = this.readLocal();
    const filtered = all.filter(r => r.id !== id);
    if (all.length === filtered.length) return false;
    this.writeLocal(filtered);
    return true;
  }
}

export const reviewsRepository = new ReviewsRepository();

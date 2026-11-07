// src/core/reviews/spam-protection.ts
import { createHash } from 'crypto';
import { ReviewSubmissionPayload } from './reviews.interface';
import { TOOLS_REGISTRY } from '@/config/tools-registry';

export function hashClientIp(rawIp: string): string {
  const salt = process.env.ADMIN_SECRET_KEY || 'pdfconverter-crypto-salt-2026';
  return createHash('sha256').update(`${rawIp}:${salt}`).digest('hex');
}

export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .trim();
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleanData?: {
    itemSlug: string;
    authorName: string;
    rating: number;
    title?: string;
    comment?: string;
  };
}

export function validateReviewSubmission(payload: ReviewSubmissionPayload): ValidationResult {
  // 1. Invisible honeypot check
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return { isValid: false, error: 'Spam validation check failed.' };
  }

  // 2. Validate itemSlug against active tools registry
  const itemSlug = sanitizeText(payload.itemSlug || '');
  if (itemSlug !== 'site' && !TOOLS_REGISTRY[itemSlug]) {
    return { isValid: false, error: 'Invalid document converter specified.' };
  }

  // 3. Rating scale validation
  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be an integer between 1 and 5 stars.' };
  }

  // 4. Author name bounds
  const cleanAuthor = sanitizeText(payload.authorName || '');
  if (cleanAuthor.length < 2 || cleanAuthor.length > 50) {
    return { isValid: false, error: 'Author name must be between 2 and 50 characters.' };
  }

  // 5. Title & comment bounds
  let cleanTitle: string | undefined;
  if (payload.title) {
    cleanTitle = sanitizeText(payload.title).slice(0, 80);
  }

  let cleanComment: string | undefined;
  if (payload.comment) {
    cleanComment = sanitizeText(payload.comment).slice(0, 1000);
  }

  return {
    isValid: true,
    cleanData: {
      itemSlug,
      authorName: cleanAuthor,
      rating,
      title: cleanTitle || undefined,
      comment: cleanComment || undefined,
    },
  };
}
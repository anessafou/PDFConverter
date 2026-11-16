import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import { hashClientIp, validateReviewSubmission } from '@/core/reviews/spam-protection';
import { ReviewSubmissionPayload } from '@/core/reviews/reviews.interface';
import { TOOLS_REGISTRY } from '@/config/tools-registry';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemSlug = searchParams.get('itemSlug') || '';
  const starParam = searchParams.get('stars');
  const sortByParam = searchParams.get('sortBy') as 'newest' | 'highest' | 'lowest' | null;

  if (itemSlug !== 'site' && !Object.hasOwn(TOOLS_REGISTRY, itemSlug)) {
    return NextResponse.json({ error: 'Converter not found.' }, { status: 404 });
  }

  const starFilter = starParam === null ? undefined : Number(starParam);
  if ((starFilter !== undefined && (!Number.isInteger(starFilter) || starFilter < 1 || starFilter > 5)) ||
      (sortByParam !== null && !['newest', 'highest', 'lowest'].includes(sortByParam))) {
    return NextResponse.json({ error: 'Invalid rating filter or sort order.' }, { status: 400 });
  }
  const sortBy = sortByParam || 'newest';

  try {
    const [reviews, stats] = await Promise.all([
      reviewsRepository.getPublishedReviews(itemSlug, { starFilter, sortBy, limit: 50 }),
      reviewsRepository.getAggregateStats(itemSlug),
    ]);

    return NextResponse.json(
      { reviews: reviews.map(({ ipHash, ...review }) => review), stats },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Review data unavailable.');
    return NextResponse.json({ reviews: [], stats: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashClientIp(ip);

    // Rate limit: 5 reviews per IP per hour
    const isAllowed = await reviewsRepository.checkRateLimit(`ratelimit:reviews:${ipHash}`, 5, 3600);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'You have submitted several reviews recently. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const body: ReviewSubmissionPayload = await req.json();
    const validation = validateReviewSubmission(body);

    if (!validation.isValid || !validation.cleanData) {
      return NextResponse.json({ error: validation.error || 'Invalid review data.' }, { status: 400 });
    }

    const review = await reviewsRepository.createReview(validation.cleanData, ipHash);

    // Revalidate the tool page for fresh ISR caches
    revalidatePath('/', 'layout');

    return NextResponse.json(
      {
        message: 'Your review has been submitted and published successfully!',
        review: (({ ipHash, ...publicReview }) => publicReview)(review),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submission failed.');
    return NextResponse.json({ error: 'Could not process review submission.' }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const newCount = await reviewsRepository.voteHelpful(id);
    if (newCount === null) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ helpfulCount: newCount });
  } catch (error) {
    console.error('Helpful vote failed.');
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}

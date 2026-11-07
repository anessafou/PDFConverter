// src/app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import { authService } from '@/core/auth/postgres-adapter';
import { ReviewStatus } from '@/core/reviews/reviews.interface';

async function authenticateAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const user = await authService.validateSession(token);
  return user !== null && (user.role === 'superadmin' || user.role === 'editor');
}

export async function GET(req: NextRequest) {
  if (!(await authenticateAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as ReviewStatus | undefined;

  const reviews = await reviewsRepository.getAllReviewsForAdmin(status);
  return NextResponse.json({ reviews });
}

export async function PATCH(req: NextRequest) {
  if (!(await authenticateAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !['pending', 'published', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const updated = await reviewsRepository.updateReviewStatus(id, status as ReviewStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    // Invalidate stale caches immediately upon review status change
    revalidatePath(`/${updated.itemSlug}`);

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error('Admin review update error:', error);
    return NextResponse.json({ error: 'Review status update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await authenticateAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Review ID required.' }, { status: 400 });
  }

  const success = await reviewsRepository.deleteReview(id);
  if (!success) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
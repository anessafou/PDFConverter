import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from '@/core/reviews/reviews-repository';
import { authService } from '@/core/auth/postgres-adapter';
import type { ReviewStatus } from '@/core/reviews/reviews.interface';

const statuses = ['pending', 'published', 'rejected'];
async function authorized(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const user = token ? await authService.validateSession(token) : null;
  return user && ['superadmin', 'editor'].includes(user.role);
}
const unavailable = () => NextResponse.json({ error: 'Review storage is unavailable. Please try again.' }, { status: 503 });

export async function GET(req: NextRequest) {
  try {
    if (!await authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const status = req.nextUrl.searchParams.get('status');
    if (status && !statuses.includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    const reviews = await reviewsRepository.getAllReviewsForAdmin((status || undefined) as ReviewStatus | undefined);
    return NextResponse.json({ reviews }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { console.error('Admin review read failed:', error); return unavailable(); }
}
export async function PATCH(req: NextRequest) {
  try {
    if (!await authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, status } = await req.json();
    if (typeof id !== 'string' || !id || !statuses.includes(status)) return NextResponse.json({ error: 'Invalid review ID or status.' }, { status: 400 });
    const review = await reviewsRepository.updateReviewStatus(id, status as ReviewStatus);
    if (!review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ review });
  } catch (error) { console.error('Review moderation failed:', error); return unavailable(); }
}
export async function DELETE(req: NextRequest) {
  try {
    if (!await authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Review ID required.' }, { status: 400 });
    if (!await reviewsRepository.deleteReview(id)) return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) { console.error('Review deletion failed:', error); return unavailable(); }
}

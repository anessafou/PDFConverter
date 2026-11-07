// src/components/reviews/ReviewSection.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Review, AggregateRatingStats } from '@/core/reviews/reviews.interface';
import { TOOLS_REGISTRY } from '@/config/tools-registry';

interface ReviewSectionProps {
  itemSlug: string;
  toolName: string;
  initialStats?: AggregateRatingStats | null;
  initialReviews?: Review[];
}

export default function ReviewSection({
  itemSlug,
  toolName,
  initialStats = null,
  initialReviews = [],
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<AggregateRatingStats | null>(initialStats);
  const [isLoading, setIsLoading] = useState(initialReviews.length === 0 && !initialStats);

  // Filters & Sorting
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Slider State & Refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helpful Votes Tracking
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // ─── Filter, Deduplicate & Prioritize Reviews ───────────────────────────
  const processedReviews = useMemo(() => {
    // 1. Only genuine reviews with substantive written comments (hide empty ratings)
    const withComments = reviews.filter(
      (r) => typeof r.comment === 'string' && r.comment.trim().length > 0
    );

    // 2. Deduplicate reviews by normalized author and comment text
    const seen = new Set<string>();
    const unique: Review[] = [];
    for (const r of withComments) {
      const key = `${r.authorName.trim().toLowerCase()}|${r.comment!.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    // 3. When default sorting, prioritize reviews naturally mentioning core features
    if (sortBy === 'newest') {
      const featureKeywords = [
        'pdflab',
        'pdfconverter',
        'pdf converter',
        'converter',
        'merge pdf',
        'merge',
        'compress pdf',
        'compress',
        'pdf to word',
        'word to pdf',
        'free pdf',
        'free',
        'ease of use',
        'easy to use',
        'fast',
        'in-browser',
        'without watermark',
      ];

      return [...unique].sort((a, b) => {
        const aText = `${a.title || ''} ${a.comment || ''}`.toLowerCase();
        const bText = `${b.title || ''} ${b.comment || ''}`.toLowerCase();
        const aScore = featureKeywords.reduce((acc, kw) => acc + (aText.includes(kw) ? 1 : 0), 0);
        const bScore = featureKeywords.reduce((acc, kw) => acc + (bText.includes(kw) ? 1 : 0), 0);

        if (bScore !== aScore) {
          return bScore - aScore; // Higher relevance first
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return unique;
  }, [reviews, sortBy]);

  // ─── Track Horizontal Scroll Boundaries ─────────────────────────────────
  const updateScrollButtons = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [processedReviews, updateScrollButtons]);

  // ─── Programmatic Carousel Navigation (Isolated from Page Scroll) ───────
  const scrollSlider = (direction: 'left' | 'right', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const container = sliderRef.current;
    if (!container) return;

    // Calculate card width + gap (approx 360-380px)
    const firstCard = container.querySelector<HTMLElement>('.review-slider-card');
    const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 360;

    if (direction === 'left') {
      if (container.scrollLeft <= 10) {
        // Smooth loop to the end
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 15) {
        // Smooth loop back to the start
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }

    setTimeout(updateScrollButtons, 350);
  };

  // ─── Fetch Reviews When Filtering / Sorting Changes ─────────────────────
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let url = `/api/reviews?itemSlug=${encodeURIComponent(itemSlug)}&sortBy=${sortBy}`;
      if (starFilter) url += `&stars=${starFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (starFilter !== null || sortBy !== 'newest' || reviews.length === 0) {
      fetchReviews();
    }
  }, [itemSlug, starFilter, sortBy]);

  // ─── Helpful Vote Handler ───────────────────────────────────────────────
  const handleHelpfulVote = async (id: string) => {
    if (votedIds.has(id)) return;

    setVotedIds((prev) => new Set(prev).add(id));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );

    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // ─── Review Submission Handler ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemSlug,
          authorName,
          rating,
          title,
          comment,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit review.');
      } else {
        setSubmitSuccess(data.message);
        setAuthorName('');
        setTitle('');
        setComment('');
        setRating(5);

        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
          setStats((prev) => {
            if (!prev) {
              return {
                itemSlug,
                ratingValue: data.review.rating,
                reviewCount: 1,
                ratingCount: 1,
                bestRating: 5,
                worstRating: 1,
                distribution: {
                  5: data.review.rating === 5 ? 1 : 0,
                  4: data.review.rating === 4 ? 1 : 0,
                  3: data.review.rating === 3 ? 1 : 0,
                  2: data.review.rating === 2 ? 1 : 0,
                  1: data.review.rating === 1 ? 1 : 0,
                },
              };
            }

            const newCount = prev.reviewCount + 1;
            const newDist = { ...prev.distribution };
            const star = data.review.rating as 1 | 2 | 3 | 4 | 5;
            newDist[star] = (newDist[star] || 0) + 1;

            const totalScore =
              newDist[5] * 5 + newDist[4] * 4 + newDist[3] * 3 + newDist[2] * 2 + newDist[1] * 1;
            const newAvg = parseFloat((totalScore / newCount).toFixed(1));

            return {
              ...prev,
              ratingValue: newAvg,
              reviewCount: newCount,
              ratingCount: newCount,
              distribution: newDist,
            };
          });
        }

        setTimeout(() => setShowForm(false), 3500);
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto my-16 px-4 text-left">
      <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              User Reviews & Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Feedback submitted by users for {toolName}.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {!showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setSubmitSuccess(null);
                  setErrorMessage(null);
                }}
                className="px-4 py-2 bg-[#FF2E54] hover:bg-[#E02447] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <span>★</span>
                <span>Write a Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Ratings Overview */}
        {stats && stats.reviewCount > 0 ? (
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/80 md:pr-6">
              <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.ratingValue.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 my-2 text-amber-400 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= Math.round(stats.ratingValue) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on <span className="font-bold text-slate-800 dark:text-slate-200">{stats.reviewCount.toLocaleString()}</span> {stats.reviewCount === 1 ? 'user review' : 'user reviews'}
              </p>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
                const percentage = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
                const isSelected = starFilter === stars;

                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? null : stars)}
                    className={`w-full flex items-center gap-3 p-1 rounded-lg transition-colors group ${
                      isSelected ? 'bg-rose-50 dark:bg-rose-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <span className="w-14 font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#FF2E54] text-left">
                      {stars} stars
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-slate-400">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center mb-8">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No reviews yet for {toolName}.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Be the first to share your experience with this tool!
              </p>
            </div>
          )
        )}

        {/* Review Submission Form Panel */}
        {showForm && (
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 sm:p-8 border border-rose-200/80 dark:border-rose-900/40 shadow-xl mb-8 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review {toolName}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                ✓ {submitSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="hp_field"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl text-amber-400 focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        {star <= (hoverRating || rating) ? '★' : '☆'}
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-3">
                      {hoverRating || rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Alex Carter"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Headline <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fast and preserved all table formatting!"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Feedback <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how this tool performed for your files..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54] resize-none"
                  />
                  <div className="text-[10px] text-slate-400 text-right mt-1">
                    {comment.length} / 1000 characters
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-500 font-semibold">{errorMessage}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-slate-400">
                    🔒 Published directly to community feedback.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter & Sort Controls Bar */}
        {stats && stats.reviewCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  starFilter === null
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarFilter(starFilter === s ? null : s)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                    starFilter === s
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {s}★
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
                className="bg-white dark:bg-darkBg-card border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF2E54]"
              >
                <option value="newest">Most Relevant</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
        )}

        {/* ─── Horizontal Reviews Carousel with Prominent Flanking Arrows ──── */}
        {processedReviews.length > 0 ? (
          <div className="relative py-2">
            {/* Prominent Flanking Left Arrow Button (←) */}
            {processedReviews.length > 1 && (
              <button
                type="button"
                onClick={(e) => scrollSlider('left', e)}
                aria-label="Scroll reviews left"
                title="Scroll reviews left (←)"
                className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 shadow-xl hover:border-[#FF2E54] hover:bg-[#FF2E54] hover:text-white dark:hover:bg-[#FF2E54] dark:hover:border-[#FF2E54] dark:hover:text-white transition-all flex items-center justify-center font-bold text-xl active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]/50 cursor-pointer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}

            {/* Horizontal Track with Overscroll Containment */}
            <div
              ref={sliderRef}
              onScroll={updateScrollButtons}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {processedReviews.map((r) => (
                <div
                  key={r.id}
                  className="review-slider-card w-[84vw] sm:w-[340px] md:w-[370px] shrink-0 snap-start bg-white dark:bg-[#111625] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Review Header: Avatar, Name & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#FF2E54] font-bold text-xs flex items-center justify-center shrink-0">
                          {r.authorName.charAt(0).toUpperCase()}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                            {r.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s}>{s <= r.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>

                    {/* Headline */}
                    {r.title && (
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 line-clamp-1">
                        {r.title}
                      </h4>
                    )}

                    {/* Review Comment Text */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {r.comment}
                    </p>
                  </div>

                  {/* Card Bottom: Specific Tool Tag & Helpful Button */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                      {r.itemSlug === 'site'
                        ? 'PDFConverter Suite'
                        : TOOLS_REGISTRY[r.itemSlug]?.name || r.itemSlug}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(r.id)}
                      disabled={votedIds.has(r.id)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors shrink-0 ${
                        votedIds.has(r.id)
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                          : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>👍 Helpful</span>
                      {(r.helpfulCount || 0) > 0 && <span>({r.helpfulCount})</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Prominent Flanking Right Arrow Button (→) */}
            {processedReviews.length > 1 && (
              <button
                type="button"
                onClick={(e) => scrollSlider('right', e)}
                aria-label="Scroll reviews right"
                title="Scroll reviews right (→)"
                className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 shadow-xl hover:border-[#FF2E54] hover:bg-[#FF2E54] hover:text-white dark:hover:bg-[#FF2E54] dark:hover:border-[#FF2E54] dark:hover:text-white transition-all flex items-center justify-center font-bold text-xl active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]/50 cursor-pointer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}

            {/* Bottom Responsive Navigation Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => scrollSlider('left', e)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] hover:border-[#FF2E54] hover:text-[#FF2E54] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 font-bold shadow-sm"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => scrollSlider('right', e)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] hover:border-[#FF2E54] hover:text-[#FF2E54] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 font-bold shadow-sm"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
                <span className="hidden sm:inline text-slate-400 ml-2">Use arrows (← →) or swipe to explore</span>
              </div>
              <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                {processedReviews.length} verified reviews
              </span>
            </div>
          </div>
        ) : (
          reviews.length > 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No written reviews match the selected filter.
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className="text-[#FF2E54] font-bold ml-1.5 hover:underline"
              >
                Show all reviews
              </button>
            </div>
          )
        )}
      </div>
    </section>
  );
}
// src/components/reviews/HomeReviewCarousel.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Review, AggregateRatingStats } from '@/core/reviews/reviews.interface';
import { TOOLS_REGISTRY } from '@/config/tools-registry';

interface HomeReviewCarouselProps {
  initialStats?: AggregateRatingStats | null;
  initialReviews?: Review[];
}

// Keywords that indicate genuine user experiences with PDF and document tools
const TOOL_RELEVANCE_KEYWORDS = [
  'pdf',
  'word',
  'excel',
  'convert',
  'table',
  'format',
  'compress',
  'merge',
  'split',
  'page',
  'doc',
  'docx',
  'xlsx',
  'jpg',
  'png',
  'heic',
  'resolution',
  'font',
  'margin',
  'quality',
  'thesis',
  'proposal',
  'contract',
  'spreadsheet',
  'slide',
];

export default function HomeReviewCarousel({
  initialStats = null,
  initialReviews = [],
}: HomeReviewCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<AggregateRatingStats | null>(initialStats);
  const [isLoading, setIsLoading] = useState(initialReviews.length === 0 && !initialStats);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Touch Swipe State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Submission Form State
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

  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Dynamically calculate cards per view based on container / screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2); // Tablet: 2 cards
      } else {
        setCardsPerView(3); // Desktop: 3 cards
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch reviews if not provided via SSR
  useEffect(() => {
    if (reviews.length === 0) {
      setIsLoading(true);
      fetch('/api/reviews?itemSlug=site&limit=50')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setReviews(data.reviews || []);
            setStats(data.stats || null);
          }
        })
        .catch((err) => console.error('Failed to load homepage reviews:', err))
        .finally(() => setIsLoading(false));
    }
  }, [reviews.length]);

  // ─── FILTER & PRIORITIZE REVIEWS ─────────────────────────────
  // 1. Filters out empty, very short (< 35 chars), or meaningless feedback.
  // 2. Prioritizes in-depth reviews detailing tool features and workflows.
  const displayReviews = useMemo(() => {
    const meaningful = reviews.filter((r) => {
      if (!r.comment) return false;
      const clean = r.comment.trim();
      // Exclude empty or low-value filler (e.g. "good", "nice", "ok")
      return clean.length >= 35;
    });

    return [...meaningful].sort((a, b) => {
      const textA = `${a.title || ''} ${a.comment || ''}`.toLowerCase();
      const textB = `${b.title || ''} ${b.comment || ''}`.toLowerCase();

      let scoreA = a.rating * 10;
      let scoreB = b.rating * 10;

      for (const kw of TOOL_RELEVANCE_KEYWORDS) {
        if (textA.includes(kw)) scoreA += 6;
        if (textB.includes(kw)) scoreB += 6;
      }

      // Reward detailed comments
      if ((a.comment?.length || 0) >= 70) scoreA += 15;
      if ((b.comment?.length || 0) >= 70) scoreB += 15;

      // Reward helpfulness votes
      scoreA += (a.helpfulCount || 0) * 3;
      scoreB += (b.helpfulCount || 0) * 3;

      return scoreB - scoreA;
    });
  }, [reviews]);

  // Max sliding index
  const maxIndex = Math.max(0, displayReviews.length - cardsPerView);

  // Keep index within bounds on resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [cardsPerView, maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      handleNext(); // Swiped left -> next
    } else if (distance < -50) {
      handlePrev(); // Swiped right -> prev
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

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
          itemSlug: 'site',
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
            if (!prev) return null;
            const newCount = prev.reviewCount + 1;
            const newDist = { ...prev.distribution };
            const star = data.review.rating as 1 | 2 | 3 | 4 | 5;
            newDist[star] = (newDist[star] || 0) + 1;
            const total =
              newDist[5] * 5 + newDist[4] * 4 + newDist[3] * 3 + newDist[2] * 2 + newDist[1] * 1;
            return {
              ...prev,
              ratingValue: parseFloat((total / newCount).toFixed(1)),
              reviewCount: newCount,
              ratingCount: newCount,
              distribution: newDist,
            };
          });
        }

        setTimeout(() => setShowForm(false), 3500);
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─── 1. SECTION HEADER ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-900/40 mb-2">
            ★ Real User Experiences
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            User Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Read what professionals, students, and businesses say about PDFConverter.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSubmitSuccess(null);
              setErrorMessage(null);
            }}
            className="px-5 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white text-xs font-bold rounded-full shadow-md shadow-rose-500/25 transition-all self-start sm:self-auto flex items-center gap-1.5 hover:scale-105"
          >
            <span>★</span>
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* ─── 2. AGGREGATE SCORE & STATS OVERVIEW ──────────────────── */}
      {stats && stats.reviewCount > 0 && (
        <div className="bg-slate-50 dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/80 shadow-sm mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:border-r border-slate-200 dark:border-slate-800 md:pr-8">
            <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.ratingValue.toFixed(1)}
            </div>
            <div className="flex justify-center gap-1 my-2 text-amber-400 text-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>{star <= Math.round(stats.ratingValue) ? '★' : '☆'}</span>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {stats.reviewCount.toLocaleString()}
              </span>{' '}
              genuine user reviews
            </p>
          </div>

          <div className="md:col-span-2 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-14 font-bold text-slate-600 dark:text-slate-400">
                    {stars} stars
                  </span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-slate-500 dark:text-slate-400">
                    {count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. SUBMISSION FORM PANEL ─────────────────────────────── */}
      {showForm && (
        <div className="bg-white dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-rose-200/80 dark:border-rose-900/40 shadow-xl mb-12 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Write a Review for PDFConverter
            </h3>
            <button
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
                name="hp_website_check"
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
                  placeholder="e.g. Sarah Jenkins"
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
                  placeholder="e.g. Converted my thesis without losing table formats!"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Feedback <span className="text-slate-400 font-normal">(Detailed experiences help others)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what file format you converted and how the layout turned out..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF2E54] resize-none"
                />
              </div>

              {errorMessage && <p className="text-xs text-rose-500 font-semibold">{errorMessage}</p>}

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-slate-400">
                  🔒 Published directly to genuine community feedback.
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

      {/* ─── 4. CAROUSEL CONTROLS BAR ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Featured Feedback ({displayReviews.length})
          </span>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] text-slate-700 dark:text-slate-200 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] hover:text-[#FF2E54] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
            aria-label="Previous review cards"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] text-slate-700 dark:text-slate-200 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] hover:text-[#FF2E54] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
            aria-label="Next review cards"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── 5. HORIZONTAL CAROUSEL TRACK ─────────────────────────── */}
      <div
        className="relative overflow-hidden -mx-2.5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
          }}
        >
          {displayReviews.map((r) => {
            const toolMeta = TOOLS_REGISTRY[r.itemSlug];
            const toolBadgeName =
              r.itemSlug === 'site' ? 'PDFConverter' : toolMeta?.name || r.itemSlug;

            return (
              <div
                key={r.id}
                style={{ flex: `0 0 ${100 / cardsPerView}%` }}
                className="px-2.5 shrink-0"
              >
                <div className="h-full bg-white dark:bg-[#111625] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/10 to-[#FF2E54]/20 text-[#FF2E54] font-black text-sm flex items-center justify-center border border-rose-200/50 dark:border-rose-900/40">
                          {r.authorName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            {r.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* 5 Amber Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s}>{s <= r.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    {r.title && (
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                        {r.title}
                      </h4>
                    )}

                    {/* Detailed Review Comment */}
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>

                  {/* Card Footer: Tool Tag & Helpful Vote */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full text-[10px]">
                      {toolBadgeName}
                    </span>

                    <button
                      onClick={() => handleHelpfulVote(r.id)}
                      disabled={votedIds.has(r.id)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors ${
                        votedIds.has(r.id)
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                          : 'hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>👍 Helpful</span>
                      {(r.helpfulCount || 0) > 0 && <span>({r.helpfulCount})</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 6. PAGINATION DOTS ───────────────────────────────────── */}
      {maxIndex > 0 && (
        <div className="flex justify-center items-center gap-1.5 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-6 bg-[#FF2E54]'
                  : 'w-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300'
              }`}
              aria-label={`Jump to review slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { Review, ReviewStatus } from '@/core/reviews/reviews.interface';

export default function AdminDashboardPage() {
  const tools = Object.values(TOOLS_REGISTRY);
  const [activeTab, setActiveTab] = useState<'tools' | 'reviews'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAdminReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const url = filterStatus === 'all' 
        ? '/api/admin/reviews' 
        : `/api/admin/reviews?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load admin reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAdminReviews();
    }
  }, [activeTab, filterStatus]);

  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setActionMessage(`Review updated to ${status}.`);
        fetchAdminReviews();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      setActionMessage('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMessage('Review permanently deleted.');
        fetchAdminReviews();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      setActionMessage('Failed to delete review.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg p-6 sm:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Admin Operations</h1>
            <p className="text-xs text-slate-500">Managing www.pdfconverter.space</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#FF2E54] text-white shadow-md shadow-rose-500/20'
                  : 'bg-white dark:bg-darkBg-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Review Moderation
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tools'
                  ? 'bg-[#FF2E54] text-white shadow-md shadow-rose-500/20'
                  : 'bg-white dark:bg-darkBg-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Services Catalog ({tools.length})
            </button>
          </div>
        </header>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            ✓ {actionMessage}
          </div>
        )}

        {/* ── TAB 1: REVIEW MODERATION ──────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  User Submitted Reviews
                </h2>
                <p className="text-xs text-slate-400">
                  Only approved reviews are published and output in Google structured data.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex gap-1.5 text-xs">
                {(['all', 'pending', 'published', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingReviews ? (
              <p className="text-xs text-slate-400 py-8 text-center">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No reviews found under the &quot;{filterStatus}&quot; filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Tool</th>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Comment</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                          {r.itemSlug}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {r.authorName}
                        </td>
                        <td className="px-4 py-3 text-amber-500 font-bold whitespace-nowrap">
                          {r.rating} ★
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate" title={r.comment}>
                          {r.title && <strong className="mr-1">{r.title}</strong>}
                          {r.comment || <span className="text-slate-400 italic">No text</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : r.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                          {r.status !== 'published' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'published')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded"
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'rejected')}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-bold text-[10px] rounded"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold text-[10px] rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SERVICES DIRECTORY ─────────────────────────── */}
        {activeTab === 'tools' && (
          <div className="bg-white dark:bg-darkBg-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-800 dark:text-white">Active Services Directory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Tool Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Input</th>
                    <th className="px-4 py-3">Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tools.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">/{t.slug}</td>
                      <td className="px-4 py-3 text-xs">{t.inputFormat.join(', ')}</td>
                      <td className="px-4 py-3 font-mono text-xs uppercase font-bold">{t.outputFormat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
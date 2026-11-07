// src/app/markdown-editor/MarkdownEditorClient.tsx
'use client';

import React, { useState } from 'react';
import ReviewSection from '@/components/reviews/ReviewSection';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface MarkdownEditorClientProps {
  initialStats?: AggregateRatingStats | null;
  initialReviews?: Review[];
}

export default function MarkdownEditorClient({
  initialStats = null,
  initialReviews = [],
}: MarkdownEditorClientProps) {
  const [content, setContent] = useState<string>(
    `# Welcome to PDFConverter Markdown Editor\n\nStart typing your markdown on the left and see it previewed in real-time.\n\n- Real-time updates\n- One-click export\n- 100% free and in-browser`
  );

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Live Markdown Editor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Edit, format, and download your Markdown notes instantly.</p>
          </div>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="px-4 py-2 bg-[#FF2E54] hover:bg-[#E02447] text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            Download .MD
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
          <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Input (Markdown)</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF2E54] text-slate-800 dark:text-slate-200"
              placeholder="Type your markdown here..."
            />
          </div>

          <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</span>
            <div className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200">
              {content}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <ReviewSection
            itemSlug="markdown-editor"
            toolName="Markdown Editor"
            initialStats={initialStats}
            initialReviews={initialReviews}
          />
        </div>
      </div>
    </main>
  );
}
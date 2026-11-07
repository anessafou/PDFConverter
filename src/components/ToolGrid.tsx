// src/components/ToolGrid.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TOOLS_REGISTRY, ToolDefinition, ServiceCategory } from '@/config/tools-registry';

// Filter tabs matching the screenshot
const FILTER_TABS: { label: string; value: ServiceCategory | 'all' }[] = [
  { label: 'All Tools', value: 'all' },
  { label: 'PDF to ...', value: 'pdf-to' },
  { label: 'Convert to PDF', value: 'convert-to-pdf' },
  { label: 'Edit & Organize', value: 'document' },
  { label: 'Image Tools', value: 'image' },
  { label: 'More', value: 'utility' },
];

export default function ToolGrid() {
  const [activeTab, setActiveTab] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toolsList = useMemo(() => Object.values(TOOLS_REGISTRY), []);

  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      const matchesCategory = activeTab === 'all' || tool.category === activeTab;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.slug.toLowerCase().includes(query) ||
        tool.outputFormat.toLowerCase().includes(query) ||
        tool.inputFormat.some((ext) => ext.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [toolsList, activeTab, searchQuery]);

  return (
    <section id="all-tools" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─── 1. SECTION HEADER ────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore All <span className="text-[#FF2E54]">79+</span> Converters & Document Tools
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Browse our complete collection of PDF tools and converters.
        </p>
      </div>

      {/* ─── 2. TABS & SEARCH BAR CONTROLS ───────────────────────── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FF2E54] text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 border border-transparent dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search for a tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-9 py-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E54]/50 focus:border-[#FF2E54]"
          />
          <div className="absolute right-3.5 top-2.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── 3. 4-COLUMN HORIZONTAL COMPACT CARDS ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredTools.map((tool) => (
          <ToolCardItem key={tool.slug} tool={tool} />
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            No converter found matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
            className="mt-3 px-4 py-1.5 text-xs font-bold text-[#FF2E54] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}

// ─── CARD ITEM COMPONENT ──────────────────────────────────────────
function ToolCardItem({ tool }: { tool: ToolDefinition }) {
  const badge = getToolBadgeStyle(tool);

  return (
    <Link
      href={`/${tool.slug}`}
      className="group relative flex items-center justify-between p-3.5 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#151c2e] border border-slate-200/90 dark:border-slate-800/80 hover:border-[#FF2E54]/50 dark:hover:border-slate-700 rounded-2xl transition-all duration-150 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Left Squircle Badge with Icon / Letter */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${badge.bgColor} ${badge.textColor}`}
        >
          {badge.icon}
        </div>

        {/* Middle Tool Name & Subtitle */}
        <div className="min-w-0">
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#FF2E54] dark:group-hover:text-[#FF2E54] transition-colors truncate">
            {tool.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
            {getCleanSubtitle(tool)}
          </p>
        </div>
      </div>

      {/* Right Chevron Arrow */}
      <span className="text-slate-300 dark:text-slate-600 group-hover:text-[#FF2E54] group-hover:translate-x-0.5 transition-all shrink-0 text-sm font-semibold">
        &rsaquo;
      </span>
    </Link>
  );
}

// ─── BADGE ICON & COLOR RESOLVER ──────────────────────────────────
function getToolBadgeStyle(tool: ToolDefinition) {
  const slug = tool.slug.toLowerCase();

  // 1. View Documents Online (Eye / Preview Icon with Rose Badge)
  if (slug === 'view-documents-online') {
    return {
      bgColor: 'bg-rose-500 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    };
  }

  // 2. Markdown Editor (Pencil / Code Icon with Violet Badge)
  if (slug === 'markdown-editor') {
    return {
      bgColor: 'bg-violet-600 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    };
  }

  // 3. Word / DOCX / ODT (Blue 'W') - Exact boundary check avoiding 'documents'
  if (slug.includes('word') || slug.includes('docx') || slug.startsWith('doc-') || slug.endsWith('-doc') || slug.includes('-to-doc') || slug.includes('odt')) {
    return {
      bgColor: 'bg-blue-600 text-white',
      textColor: 'text-white',
      icon: (
        <span className="font-extrabold text-[12px] font-mono">W</span>
      ),
    };
  }

  // 4. Excel / CSV / Spreadsheets (Green 'X')
  if (slug.includes('excel') || slug.includes('xlsx') || slug.includes('csv') || slug.includes('ods')) {
    return {
      bgColor: 'bg-emerald-600 text-white',
      textColor: 'text-white',
      icon: (
        <span className="font-extrabold text-[12px] font-mono">X</span>
      ),
    };
  }

  // 5. PowerPoint / Slides (Orange 'P')
  if (slug.includes('ppt') || slug.includes('powerpoint') || slug.includes('odp')) {
    return {
      bgColor: 'bg-orange-600 text-white',
      textColor: 'text-white',
      icon: (
        <span className="font-extrabold text-[12px] font-mono">P</span>
      ),
    };
  }

  // 6. Images: JPG (Yellow/Amber)
  if (slug.includes('jpg') || slug.includes('jpeg')) {
    return {
      bgColor: 'bg-amber-500 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    };
  }

  // 7. Images: PNG (Pink / Magenta)
  if (slug.includes('png')) {
    return {
      bgColor: 'bg-pink-600 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    };
  }

  // 8. HTML / Web / Base64 (Cyan / Teal)
  if (slug.includes('html') || slug.includes('web') || slug.includes('base64')) {
    return {
      bgColor: 'bg-cyan-600 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    };
  }

  // 9. eBooks: EPUB / MOBI / AZW3 (Purple / Violet)
  if (slug.includes('epub') || slug.includes('mobi') || slug.includes('azw3')) {
    return {
      bgColor: 'bg-purple-600 text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    };
  }

  // 10. PDF Core (Rose / Red)
  if (slug.includes('compress') || slug.includes('merge') || slug.includes('split') || slug.includes('protect')) {
    return {
      bgColor: 'bg-[#FF2E54] text-white',
      textColor: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    };
  }

  // Default Document Icon (Sky Blue)
  return {
    bgColor: 'bg-sky-600 text-white',
    textColor: 'text-white',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
}

// ─── SHORT SUBTITLE FORMATTER ─────────────────────────────────────
function getCleanSubtitle(tool: ToolDefinition): string {
  // Non-converter utilities
  if (tool.slug === 'view-documents-online') {
    return 'Open & read DOCX, PDF, XLSX, PPTX in browser';
  }
  if (tool.slug === 'markdown-editor') {
    return 'Write, preview & export Markdown notes';
  }

  // Standard converters
  const out = tool.outputFormat.toUpperCase();
  const inp = tool.inputFormat.join(', ').replace(/\./g, '').toUpperCase();

  if (tool.slug === 'pdf-to-word') return 'Convert PDF to Word (DOCX)';
  if (tool.slug === 'pdf-to-jpg') return 'Convert PDF to Images (JPG)';
  if (tool.slug === 'pdf-to-excel') return 'Convert PDF to Excel (XLSX)';
  if (tool.slug === 'pdf-to-ppt') return 'Convert PDF to PowerPoint';
  if (tool.slug === 'pdf-to-png') return 'Convert PDF to PNG images';
  if (tool.slug === 'pdf-to-txt') return 'Convert PDF to Text';
  if (tool.slug === 'word-to-pdf') return 'Convert Word files to PDF format';
  if (tool.slug === 'jpg-to-pdf') return 'Merge images into a single PDF';

  return `Convert ${inp} to ${out} format`;
}
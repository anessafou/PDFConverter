// src/components/pseo/templates/HomeTemplate.tsx
import React from 'react';
import Link from 'next/link';
import ConverterWidget from '@/components/ConverterWidget';
import ToolGrid from '@/components/ToolGrid';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { Locale, LOCALES_CONFIG } from '@/config/i18n-registry';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface HomeTemplateProps {
  locale: Locale;
  stats?: AggregateRatingStats | null;
  reviews?: Review[];
}

const HOMEPAGE_FAQS = [
  {
    q: 'Is PDFConverter 100% free to use?',
    a: 'Yes. All conversion, merging, compression, and document viewing tools are completely free. There are no subscriptions, hidden fees, paywalls, or document count limits.',
  },
  {
    q: 'Are my confidential documents safe and private?',
    a: 'Yes. Most utilities (including image conversions, previews, and text extraction) execute locally in your web browser using HTML5 Canvas and WebAssembly. Any files requiring server assistance are processed in volatile memory and purged automatically within 60 minutes.',
  },
  {
    q: 'Do I need to install any software or extensions?',
    a: 'No software, browser extensions, or executable apps (.exe) are needed. All tools run directly in Safari, Chrome, Edge, and Firefox across Windows, macOS, Linux, iOS, and Android.',
  },
  {
    q: 'What is the maximum file size supported?',
    a: 'You can convert files up to 100MB per file with zero registration or email verification required.',
  },
  {
    q: 'Will my formatting, tables, and fonts stay intact?',
    a: 'Yes. Our conversion engine mirrors native Microsoft Office and Adobe rendering standards to preserve fonts, margin bounds, tables, vector paths, and high-DPI image resolutions without distortion.',
  },
];

export default function HomeTemplate({ locale, stats, reviews = [] }: HomeTemplateProps) {
  const isRTL = LOCALES_CONFIG[locale]?.dir === 'rtl';
  const heroTool = TOOLS_REGISTRY['word-to-pdf'];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <ReviewSchema
        toolName="PDFConverter"
        toolDescription="Free online PDF converter and document utility suite. Convert, merge, compress, and edit PDF files in your browser."
        toolSlug="site"
        stats={stats}
        reviews={reviews}
      />

      {/* ─── Hero Section with High-Intent H1 ─────────────────────────────── */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Free • In-Browser Processing • No Account Required</span>
              </div>

              {/* Rewritten SEO H1 */}
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Free Online <span className="text-[#FF2E54]">PDF Converter</span> & Document Suite
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Convert, merge, compress, and view PDF, Microsoft Office, and image files directly in your web browser. Fast, private, and zero watermark exports.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#popular-tools"
                  className="px-7 py-3.5 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-sm rounded-full shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
                >
                  Start Converting Now &rarr;
                </a>
                <a
                  href="#all-tools"
                  className="px-7 py-3.5 bg-white dark:bg-darkBg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm rounded-full transition-all"
                >
                  Explore All 86 Tools
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">Zero Watermarks</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">100% clean output</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">High Security</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Client-side memory</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">No File Caps</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Files up to 100MB</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6" dir="ltr">
              <ConverterWidget tool={heroTool} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Quick Directory Hubs ───────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-[#111625] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tool Categories</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Jump directly to specialized document tool hubs.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { slug: 'pdf-to', name: 'PDF to Office/Images', count: '26 Tools', icon: '📄' },
              { slug: 'convert-to-pdf', name: 'Convert to PDF', count: '21 Tools', icon: '📥' },
              { slug: 'document', name: 'Organize & Compress', count: '17 Tools', icon: '⚡' },
              { slug: 'image', name: 'Image Converters', count: '19 Tools', icon: '🖼️' },
              { slug: 'utility', name: 'Utilities & Viewers', count: '3 Tools', icon: '🛠️' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all group"
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#FF2E54] transition-colors">{cat.name}</h3>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popular Tools Grid ─────────────────────────────────────────── */}
      <section id="popular-tools" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Most Popular Tools</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Instant access to our highest-volume conversion utilities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { slug: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one document', badge: 'Popular', color: 'bg-rose-600' },
            { slug: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce PDF file size without quality loss', badge: 'Hot', color: 'bg-amber-600' },
            { slug: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF to editable DOCX format', badge: 'High-Demand', color: 'bg-blue-600' },
            { slug: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX & DOC to high-quality PDF', badge: 'Essential', color: 'bg-blue-700' },
            { slug: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Extract pages to crisp high-DPI images', badge: 'Fast', color: 'bg-amber-500' },
            { slug: 'pdf-to-excel', name: 'PDF to Excel', desc: 'Extract tables into XLSX spreadsheets', badge: 'Precise', color: 'bg-emerald-600' },
            { slug: 'split-pdf', name: 'Split PDF', desc: 'Extract specific pages into separate files', badge: 'Utility', color: 'bg-purple-600' },
            { slug: 'view-documents-online', name: 'Document Viewer', desc: 'Read DOCX, PDF, XLSX, PPTX in browser', badge: 'Direct', color: 'bg-teal-600' },
          ].map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-8 h-8 rounded-lg ${t.color} text-white font-black text-xs flex items-center justify-center`}>
                    {t.name.charAt(0)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#FF2E54] transition-colors">{t.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>
              <span className="text-xs font-bold text-[#FF2E54] mt-4 flex items-center gap-1">Convert Now &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works & Architecture ─────────────────────────────────── */}
      <section className="py-16 bg-slate-100/60 dark:bg-[#0d121f] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">How PDFConverter Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Three simple steps to convert or edit documents with zero configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">1</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Choose or Drop File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select your PDF, Office document, or image from your local drive, iCloud, or drag it straight into your browser window.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">2</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Instant Engine Processing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our WebAssembly and vector rendering engine converts your file while preserving fonts, tables, margins, and DPI fidelity.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">3</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Download Clean File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Click download to receive your pristine file immediately. Zero watermarks, zero email walls, and zero temporary delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Complete Directory Grid ─────────────────────────────────────── */}
      <section id="all-tools" className="py-16">
        <ToolGrid />
      </section>

      {/* ─── Comprehensive Homepage FAQ ─────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-[#111625] border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Everything you need to know about our document conversion platform.</p>
          </div>

          <div className="space-y-4">
            {HOMEPAGE_FAQS.map((faq, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
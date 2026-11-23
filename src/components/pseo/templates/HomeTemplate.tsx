
import { translate } from '@/locales/translate';
import { localizePath } from '@/locales/routing';
// src/components/pseo/templates/HomeTemplate.tsx
import React from 'react';
import Link from 'next/link';
import ConverterWidget from '@/components/ConverterWidget';
import ToolGrid from '@/components/ToolGrid';
import { TOOLS_REGISTRY, REGISTERED_TOOL_COUNT } from '@/config/tools-registry';
import { Locale, LOCALES_CONFIG } from '@/config/i18n-registry';

interface HomeTemplateProps {
  locale: Locale;
}

const HOMEPAGE_FAQS = [
  {
    q: 'Do I need an account to convert a file?',
    a: 'The public converter interface does not require registration.',
  },
  {
    q: 'When is my file uploaded?',
    a: 'Tools such as PDF merging and text extraction run in your browser. Tools such as Word to PDF send the selected file to a conversion service.',
  },
  {
    q: 'Do I need to install any software or extensions?',
    a: 'Open the tool in your browser. Some image formats depend on what the browser can read or write, and some tools require a conversion service.',
  },
  {
    q: 'What is the maximum file size supported?',
    a: 'The standard converter checks a 25 MB limit per input file. Image and PDF rendering can also hit pixel limits. Hosting may impose a lower limit on uploads to the conversion service.',
  },
  {
    q: 'Will my formatting, tables, and fonts stay intact?',
    a: 'Formatting depends on the tool, source and output format. For example, PDF to TXT extracts selectable text, while PDF to JPG renders whole pages as images. Review the result before relying on it.',
  },
];

export default function HomeTemplate({ locale }: HomeTemplateProps) {
  const t = (value: string) => translate(locale, value);
  const linkTo = (href: string) => localizePath(href, locale);

  const isRTL = LOCALES_CONFIG[locale]?.dir === 'rtl';
  const heroTool = TOOLS_REGISTRY['word-to-pdf'];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: t(faq.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.a),
      },
    })),
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      {/* ─── Hero Section with High-Intent H1 ─────────────────────────────── */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("Online tools • No account required")}</span>
              </div>

              {/* Rewritten SEO H1 */}
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {t("Free Online ")}<span className="text-[#FF2E54]">{t("PDF Converter")}</span> {t(" & Document Suite")}</h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t("Convert, organize and preview PDF, Office and image files. Some tools run in your browser, and others use a conversion service.")}</p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#popular-tools"
                  className="px-7 py-3.5 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-sm rounded-full shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
                >
                  {t("Start Converting Now →")}</a>
                <a
                  href="#all-tools"
                  className="px-7 py-3.5 bg-white dark:bg-darkBg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm rounded-full transition-all"
                >
                  {t("Explore All {0} Tools").replace("{0}", String(REGISTERED_TOOL_COUNT))}</a>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">{t("File formats")}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{t("PDF, Office and images")}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">{t("Processing")}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{t("Browser or conversion service")}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs">{t("Standard converter")}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{t("Up to 25 MB per input file")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("Tool Categories")}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("Jump directly to specialized document tool hubs.")}</p>
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
                href={linkTo(`/category/${cat.slug}`)}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all group"
              >
                <span className="text-2xl block mb-2">{t(cat.icon)}</span>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#FF2E54] transition-colors">{t(cat.name)}</h3>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{String(Object.values(TOOLS_REGISTRY).filter(tool => tool.category === cat.slug).length) + " " + t("Tools")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popular Tools Grid ─────────────────────────────────────────── */}
      <section id="popular-tools" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("Most Popular Tools")}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t("Instant access to our highest-volume conversion utilities.")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { slug: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one document', badge: 'Popular', color: 'bg-rose-600' },
            { slug: 'compress-pdf', name: 'Compress PDF', desc: 'Send a PDF to the compression service', badge: 'Hot', color: 'bg-amber-600' },
            { slug: 'pdf-to-word', name: 'PDF to Word', desc: 'Request DOCX output from the conversion service', badge: 'High-Demand', color: 'bg-blue-600' },
            { slug: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX or DOC to PDF via the service', badge: 'Essential', color: 'bg-blue-700' },
            { slug: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Render full PDF pages as JPG images', badge: 'Fast', color: 'bg-amber-500' },
            { slug: 'pdf-to-excel', name: 'PDF to Excel', desc: 'Request XLSX output from the conversion service', badge: 'Spreadsheet', color: 'bg-emerald-600' },
            { slug: 'split-pdf', name: 'Split PDF', desc: 'Download one PDF per page in a ZIP', badge: 'Utility', color: 'bg-purple-600' },
            { slug: 'view-documents-online', name: 'Document Viewer', desc: 'Read DOCX, PDF, XLSX, PPTX in browser', badge: 'Direct', color: 'bg-teal-600' },
          ].map((entry) => (
            <Link
              key={entry.slug}
              href={linkTo(`/${entry.slug}`)}
              className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-8 h-8 rounded-lg ${entry.color} text-white font-black text-xs flex items-center justify-center`}>
                    {entry.name.charAt(0)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t(entry.badge)}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#FF2E54] transition-colors">{t(entry.name)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t(entry.desc)}</p>
              </div>
              <span className="text-xs font-bold text-[#FF2E54] mt-4 flex items-center gap-1">{t("Convert Now →")}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works & Architecture ─────────────────────────────────── */}
      <section className="py-16 bg-slate-100/60 dark:bg-[#0d121f] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{t("How PDFConverter Works")}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              {t("Three simple steps to convert or edit documents with zero configuration.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">1</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("Choose or Drop File")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("Select your PDF, Office document, or image from your local drive, iCloud, or drag it straight into your browser window.")}</p>
            </div>
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">2</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("Run the conversion")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("Start the conversion. Depending on the tool, processing happens in the browser or through a conversion service.")}</p>
            </div>
            <div className="p-6 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center mb-4">3</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t("Download and review")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("Download the result and check the pages, formatting and file size before sharing.")}</p>
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
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("Frequently Asked Questions")}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t("Everything you need to know about our document conversion platform.")}</p>
          </div>

          <div className="space-y-4">
            {HOMEPAGE_FAQS.map((faq, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t(faq.q)}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t(faq.a)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
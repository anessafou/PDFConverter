// src/components/pseo/templates/HomeTemplate.tsx
import React from 'react';
import Link from 'next/link';
import ConverterWidget from '@/components/ConverterWidget';
import ToolGrid from '@/components/ToolGrid';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { Locale, getLocalizedSlug, LOCALES_CONFIG } from '@/config/i18n-registry';
import { DICTIONARIES } from '@/locales/dictionaries';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface HomeTemplateProps {
  locale: Locale;
  stats: AggregateRatingStats | null;
  reviews: Review[];
}

export default function HomeTemplate({ locale, stats, reviews }: HomeTemplateProps) {
  const dict = DICTIONARIES[locale];
  const isRTL = LOCALES_CONFIG[locale].dir === 'rtl';
  const heroTool = TOOLS_REGISTRY['word-to-pdf'];

  const makeLink = (canonicalSlug: string) => {
    if (locale === 'en') return `/${canonicalSlug}`;
    return `/${locale}/${getLocalizedSlug(canonicalSlug, locale)}`;
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
      
      {/* TS Fix: Only render schema if stats is strictly not null */}
      {stats && (
        <ReviewSchema
          toolName="PDFConverter"
          toolDescription={dict.home.description}
          toolSlug="site"
          stats={stats}
          reviews={reviews}
        />
      )}

      <section className="pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {dict.home.heroH1Pre} <span className="text-[#FF2E54]">{dict.home.heroH1Span}</span>{dict.home.heroH1Post}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {dict.home.heroSub}
              </p>

              <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 ${isRTL ? 'flex-row-reverse lg:flex-row' : ''}`}>
                <Link
                  href="/#popular-tools"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#FF2E54] to-[#FF476E] hover:from-[#E02447] hover:to-[#FF2E54] text-white font-bold text-sm rounded-full shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
                >
                  {dict.home.startNow} {isRTL ? '←' : '→'}
                </Link>
                <Link
                  href="/#all-tools"
                  className="px-7 py-3.5 bg-white dark:bg-darkBg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm rounded-full transition-all"
                >
                  {dict.home.exploreAll}
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{dict.home.trust1}</p>
                    <p className="text-[10px] text-slate-400">{dict.home.trust1Sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-xs shrink-0 font-bold">⚡</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{dict.home.trust2}</p>
                    <p className="text-[10px] text-slate-400">{dict.home.trust2Sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">📁</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{dict.home.trust3}</p>
                    <p className="text-[10px] text-slate-400">{dict.home.trust3Sub}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6" dir="ltr">
              <ConverterWidget tool={heroTool} />
            </div>
          </div>
        </div>
      </section>

      <section id="popular-tools" className="py-20 bg-slate-50 dark:bg-darkBg/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {dict.home.popularTools}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {dict.home.popularToolsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-start">
            {[
              { slug: 'pdf-to-word', icon: 'W', color: 'bg-blue-600', name: 'PDF to Word' },
              { slug: 'word-to-pdf', icon: 'DOC', color: 'bg-blue-500', name: 'Word to PDF' },
              { slug: 'pdf-to-jpg', icon: 'JPG', color: 'bg-amber-500', name: 'PDF to JPG' },
              { slug: 'pdf-to-excel', icon: 'X', color: 'bg-emerald-500', name: 'PDF to Excel' },
              { slug: 'pdf-to-png', icon: 'PNG', color: 'bg-pink-500', name: 'PDF to PNG' },
              { slug: 'jpg-to-pdf', icon: 'IMG', color: 'bg-teal-500', name: 'JPG to PDF' }
            ].map(t => {
              const translatedTool = dict.tools[t.slug]?.h1 || TOOLS_REGISTRY[t.slug].name;
              const translatedDesc = dict.tools[t.slug]?.description || TOOLS_REGISTRY[t.slug].description;
              
              return (
                <Link
                  key={t.slug}
                  href={makeLink(t.slug)}
                  className="group bg-white dark:bg-darkBg-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] hover:shadow-lg transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl ${t.color} text-white flex items-center justify-center font-black text-sm shrink-0`}>
                      {t.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[#FF2E54] transition-colors text-sm">
                        {translatedTool}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{translatedDesc}</p>
                    </div>
                  </div>
                  <span className={`text-slate-300 dark:text-slate-600 group-hover:text-[#FF2E54] transition-all ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`}>
                    &rsaquo;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {dict.home.whyChoose}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#FF2E54] flex items-center justify-center font-bold text-base">⚡</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{dict.home.why1}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dict.home.why1Sub}</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold text-base">🛡️</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{dict.home.why2}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dict.home.why2Sub}</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-base">💻</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{dict.home.why3}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dict.home.why3Sub}</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-base">★</div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{dict.home.why4}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dict.home.why4Sub}</p>
          </div>
        </div>
      </section>

      <section id="all-tools" className="py-16 bg-slate-50 dark:bg-darkBg/60 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {dict.home.exploreAll}
          </h2>
        </div>
        <div dir="ltr">
          <ToolGrid />
        </div>
      </section>

      <section id="reviews" className="py-12 bg-white dark:bg-darkBg border-t border-slate-200/80 dark:border-slate-800">
        <div dir="ltr">
          <ReviewSection itemSlug="site" toolName="PDFConverter" initialStats={stats} initialReviews={reviews} />
        </div>
      </section>
    </main>
  );
}
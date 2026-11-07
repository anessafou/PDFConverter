// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector';
import { SUPPORTED_LOCALES, Locale, getLocalizedSlug, LOCALES_CONFIG } from '@/config/i18n-registry';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [convertersOpen, setConvertersOpen] = useState(false);
  
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale | undefined;
  const currentLocale: Locale = firstSegment && SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : 'en';
  
  const isRTL = LOCALES_CONFIG[currentLocale]?.dir === 'rtl';

  // Helper to keep links in current language
  const makeLink = (slug: string) => currentLocale === 'en' ? `/${slug}` : `/${currentLocale}/${getLocalizedSlug(slug, currentLocale)}`;

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'} className="sticky top-0 z-50 bg-white/90 dark:bg-darkBg/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href={currentLocale === 'en' ? '/' : `/${currentLocale}`} className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF2E54] to-rose-400 flex items-center justify-center shadow-md shadow-rose-500/25">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              PDF<span className="text-[#FF2E54]">Converter</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href={currentLocale === 'en' ? '/' : `/${currentLocale}`} className="px-3 py-2 rounded-lg hover:text-[#FF2E54] transition-colors">Home</Link>
            
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button type="button" className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#FF2E54] transition-colors">
                Tools
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className={`absolute top-full w-64 bg-white dark:bg-darkBg-card rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 space-y-1 z-50 ${isRTL ? 'right-0 text-right' : 'left-0 text-left'}`}>
                  <Link href={makeLink('word-to-pdf')} className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Word to PDF</Link>
                  <Link href={makeLink('pdf-to-word')} className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">PDF to Word</Link>
                  <Link href={makeLink('jpg-to-pdf')} className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">JPG to PDF</Link>
                  <Link href={currentLocale === 'en' ? '/#all-tools' : `/${currentLocale}#all-tools`} className="block px-3 py-2 text-xs font-bold text-[#FF2E54] border-t border-slate-100 dark:border-slate-800 mt-1">
                    Explore all 80 tools &rarr;
                  </Link>
                </div>
              )}
            </div>
            <Link href="/contact" className="px-3 py-2 rounded-lg hover:text-[#FF2E54] transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <button type="button" onClick={toggleTheme} className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] text-slate-600 dark:text-amber-400 hover:scale-105 transition-all shadow-sm">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300">
               ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
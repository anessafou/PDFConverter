// src/components/LanguageSelector.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SUPPORTED_LOCALES,
  LOCALES_CONFIG,
  Locale,
  getLocalizedSlug,
  getCanonicalSlugFromLocalized,
} from '@/config/i18n-registry';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detect current active locale from URL path
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale | undefined;
  const currentLocale: Locale =
    firstSegment && SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : 'en';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (targetLocale: Locale) => {
    setIsOpen(false);
    if (targetLocale === currentLocale) return;

    // 1. Language persistence via Cookie
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // 2. Navigation Logic
    // If on homepage
    if (segments.length === 0 || (segments.length === 1 && SUPPORTED_LOCALES.includes(firstSegment!))) {
      router.push(targetLocale === 'en' ? '/' : `/${targetLocale}`);
      return;
    }

    // Resolve current tool slug
    const currentSlug = segments[segments.length - 1];
    const canonicalSlug = getCanonicalSlugFromLocalized(currentSlug, currentLocale);

    if (canonicalSlug) {
      const targetSlug = getLocalizedSlug(canonicalSlug, targetLocale);
      const targetUrl = targetLocale === 'en' ? `/${targetSlug}` : `/${targetLocale}/${targetSlug}`;
      router.push(targetUrl);
    } else {
      router.push(targetLocale === 'en' ? '/' : `/${targetLocale}`);
    }
  };

  const activeMeta = LOCALES_CONFIG[currentLocale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[#FF2E54] hover:text-[#FF2E54] transition-all shadow-sm"
        aria-label="Select Language"
      >
        <span>{activeMeta.flag}</span>
        <span className="hidden sm:inline">{activeMeta.nativeName}</span>
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#111625] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {SUPPORTED_LOCALES.map((loc) => {
            const meta = LOCALES_CONFIG[loc];
            const isSelected = loc === currentLocale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelectLanguage(loc)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{meta.flag}</span>
                  <span>{meta.nativeName}</span>
                </span>
                {isSelected && <span className="text-[#FF2E54]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
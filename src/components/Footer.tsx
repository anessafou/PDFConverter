// src/components/Footer.tsx
'use client';
import { useTranslations, useLocalizedPath, useLocale } from '@/locales/LocaleProvider';


import React, { useState } from 'react';
import Link from 'next/link';
import { getPublishedPseoPage } from '@/config/pseo-publication';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations();
  const linkTo = useLocalizedPath();
  const guides = [
    ['/p/word-to-pdf-for-mac', 'Word to PDF for Mac'],
    ['/p/pdf-to-word-without-watermark', 'PDF to Word and Watermarks'],
    ['/p/jpg-to-pdf-on-iphone', 'JPG to PDF on iPhone'],
    ['/p/excel-to-pdf-for-windows', 'Excel to PDF for Windows'],
  ].map(([path, label]) => ({ path: linkTo(path), label })).filter(guide => getPublishedPseoPage(guide.path));

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white dark:bg-darkBg border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href={linkTo("/")} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF2E54] to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                PDF<span className="text-[#FF2E54]">Converter</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              {t("Online tools for converting and previewing documents.")}</p>
          </div>

          {/* Popular Tools */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t("Popular Tools")}</h4>
            <ul className="space-y-2">
              <li><Link href={linkTo("/pdf-to-word")} className="hover:text-[#FF2E54] transition-colors">{t("PDF to Word")}</Link></li>
              <li><Link href={linkTo("/pdf-to-jpg")} className="hover:text-[#FF2E54] transition-colors">{t("PDF to JPG")}</Link></li>
              <li><Link href={linkTo("/pdf-to-excel")} className="hover:text-[#FF2E54] transition-colors">{t("PDF to Excel")}</Link></li>
              <li><Link href={linkTo("/pdf-to-png")} className="hover:text-[#FF2E54] transition-colors">{t("PDF to PNG")}</Link></li>
              <li><Link href={linkTo("/pdf-to-scanned-document")} className="hover:text-[#FF2E54] transition-colors">{t("PDF to Scanned Document")}</Link></li>
            </ul>
          </div>

          {/* Converters */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t("Converters")}</h4>
            <ul className="space-y-2">
              <li><Link href={linkTo("/word-to-pdf")} className="hover:text-[#FF2E54] transition-colors">{t("Word to PDF")}</Link></li>
              <li><Link href={linkTo("/jpg-to-pdf")} className="hover:text-[#FF2E54] transition-colors">{t("JPG to PDF")}</Link></li>
              <li><Link href={linkTo("/png-to-pdf")} className="hover:text-[#FF2E54] transition-colors">{t("PNG to PDF")}</Link></li>
              <li><Link href={linkTo("/image-converter")} className="hover:text-[#FF2E54] transition-colors">{t("Image Converter")}</Link></li>
              <li><Link href={linkTo("/view-documents-online")} className="hover:text-[#FF2E54] transition-colors">{t("View Documents Online")}</Link></li>
            </ul>
          </div>

          {/* Platform Guides (Solves Orphan URLs) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t("Guides & Devices")}</h4>
            <ul className="space-y-2">
              {guides.map(guide => <li key={guide.path}><Link href={guide.path} className="hover:text-[#FF2E54] transition-colors">{t(guide.label)}</Link></li>)}
            </ul>
          </div>

          {/* Legal & Company Pages */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t("Company & Legal")}</h4>
            <ul className="space-y-2">
              <li><Link href={linkTo("/privacy")} className="hover:text-[#FF2E54] transition-colors">{t("Privacy Policy")}</Link></li>
              <li><Link href={linkTo("/terms")} className="hover:text-[#FF2E54] transition-colors">{t("Terms of Service")}</Link></li>
              <li><Link href={linkTo("/contact")} className="hover:text-[#FF2E54] transition-colors">{t("Contact Support")}</Link></li>
              <li><Link href={linkTo("/markdown-editor")} className="hover:text-[#FF2E54] transition-colors">{t("Markdown Editor")}</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t("Updates")}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("Get notified when new converter tools are released.")}</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Your email address")}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF2E54] text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-lg shadow-sm transition-all"
              >
                {t(subscribed ? 'Subscribed!' : 'Subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} {t(" PDFConverter. All rights reserved.")}</p>
          <div className="flex gap-6">
            <Link href={linkTo("/privacy")} className="hover:text-[#FF2E54] transition-colors">{t("Privacy Policy")}</Link>
            <Link href={linkTo("/terms")} className="hover:text-[#FF2E54] transition-colors">{t("Terms of Service")}</Link>
            <Link href={linkTo("/contact")} className="hover:text-[#FF2E54] transition-colors">{t("Contact")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

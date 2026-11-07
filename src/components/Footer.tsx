// src/components/Footer.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF2E54] to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                PDF<span className="text-[#FF2E54]">Converter</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Fast, secure document conversion and previewing tools directly in your browser.
            </p>
          </div>

          {/* Popular Tools */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Popular Tools</h4>
            <ul className="space-y-2">
              <li><Link href="/pdf-to-word" className="hover:text-[#FF2E54] transition-colors">PDF to Word</Link></li>
              <li><Link href="/pdf-to-jpg" className="hover:text-[#FF2E54] transition-colors">PDF to JPG</Link></li>
              <li><Link href="/pdf-to-excel" className="hover:text-[#FF2E54] transition-colors">PDF to Excel</Link></li>
              <li><Link href="/pdf-to-png" className="hover:text-[#FF2E54] transition-colors">PDF to PNG</Link></li>
              <li><Link href="/pdf-to-scanned-document" className="hover:text-[#FF2E54] transition-colors">PDF to Scanned Document</Link></li>
            </ul>
          </div>

          {/* Converters */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Converters</h4>
            <ul className="space-y-2">
              <li><Link href="/word-to-pdf" className="hover:text-[#FF2E54] transition-colors">Word to PDF</Link></li>
              <li><Link href="/jpg-to-pdf" className="hover:text-[#FF2E54] transition-colors">JPG to PDF</Link></li>
              <li><Link href="/png-to-pdf" className="hover:text-[#FF2E54] transition-colors">PNG to PDF</Link></li>
              <li><Link href="/image-converter" className="hover:text-[#FF2E54] transition-colors">Image Converter</Link></li>
              <li><Link href="/view-documents-online" className="hover:text-[#FF2E54] transition-colors">View Documents Online</Link></li>
            </ul>
          </div>

          {/* Platform Guides (Solves Orphan URLs) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Guides &amp; Devices</h4>
            <ul className="space-y-2">
              <li><Link href="/p/word-to-pdf-for-mac" className="hover:text-[#FF2E54] transition-colors">Word to PDF for Mac</Link></li>
              <li><Link href="/p/pdf-to-word-without-watermark" className="hover:text-[#FF2E54] transition-colors">PDF to Word without Watermark</Link></li>
              <li><Link href="/p/jpg-to-pdf-on-iphone" className="hover:text-[#FF2E54] transition-colors">JPG to PDF on iPhone</Link></li>
              <li><Link href="/p/excel-to-pdf-for-windows" className="hover:text-[#FF2E54] transition-colors">Excel to PDF for Windows</Link></li>
            </ul>
          </div>

          {/* Legal & Company Pages */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Company &amp; Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-[#FF2E54] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#FF2E54] transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-[#FF2E54] transition-colors">Contact Support</Link></li>
              <li><Link href="/markdown-editor" className="hover:text-[#FF2E54] transition-colors">Markdown Editor</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Updates</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Get notified when new converter tools are released.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF2E54] text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-lg shadow-sm transition-all"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} PDFConverter. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#FF2E54] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#FF2E54] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#FF2E54] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { existingPathAlternates, pageMetadata } from '@/config/page-metadata';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
import { localizePath } from '@/locales/routing';
// src/app/privacy/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

const languages = existingPathAlternates('/privacy');
export const metadata: Metadata = pageMetadata('en',
  'Privacy Policy - PDFConverter',
  'Learn how PDFConverter handles your documents and data.',
  languages.en, languages,
);

export default async function PrivacyPage() {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);
  const linkTo = (href: string) => localizePath(href, locale);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#111625] rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-8">
        <div>
          <nav className="text-xs text-slate-400 mb-4">
            <Link href={linkTo("/")} className="hover:underline">{t("Home")}</Link> / <span>{t("Privacy Policy")}</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("Privacy Policy")}</h1>
          <p className="text-xs text-slate-400 mt-1">{t("Last updated: October 2026")}</p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("1. Client-First Architecture")}</h2>
          <p>
            {t("PDF merging, some image conversions and document previews process selected files in your browser.")}</p>
          <p>
            {t("The browser can still make network requests to load the page and its supporting resources.")}</p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("2. Server-Processed Files")}</h2>
          <p>
            {t("For server-assisted operations, the page uploads your selected file to the conversion endpoint, which forwards it to the configured conversion service and returns the result. Contact us for questions about server-side retention.")}</p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("3. Information We Collect")}</h2>
          <p>
            {t("We do not require account registration, usernames, or passwords to use our public converter tools.")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>{t("Reviews and Feedback:")}</strong> {t(" If you voluntarily submit a user review, we store the name you provide, your rating, and any optional written commentary.")}</li>
            <li>{t(" If you contact us, the contact form records the name, email address and message you submit.")}</li>
            <li><strong>{t("Abuse Prevention:")}</strong> {t(" We use a hash of the IP address for rate limiting on review and contact submissions.")}</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("4. Cookies and Local Storage")}</h2>
          <p>
            {t("The site uses local storage for theme preferences and cookies for language preferences and admin sessions. The page also loads Google Tag Manager.")}</p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("5. Contact Information")}</h2>
          <p>
            {t("If you have any questions regarding this Privacy Policy or our data practices, please reach out via our ")}<Link href={linkTo("/contact")} className="text-[#FF2E54] font-bold hover:underline">{t("Contact Page")}</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
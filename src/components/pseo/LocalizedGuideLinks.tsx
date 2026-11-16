import Link from 'next/link';
import type { Locale } from '@/config/i18n-registry';
import { localizedPseoHeading } from '@/config/localized-pseo-metadata';
import { getPublishedPseoPages } from '@/config/pseo-publication';
import { translate } from '@/locales/translate';

export default function LocalizedGuideLinks({ locale, toolSlug }: { locale: Locale; toolSlug: string }) {
  if (locale === 'en') return null;
  const links = getPublishedPseoPages(locale).flatMap(page =>
    page.toolSlug === toolSlug && page.intent.kind === 'platform'
      ? [{ href: page.path, label: localizedPseoHeading(locale, toolSlug, page.intent.modifier) }]
      : [],
  );
  if (!links.length) return null;
  const label = translate(locale, 'Specialized Guides & Platforms:');

  return (
    <nav aria-label={label} className="pt-4 pb-2">
      <div className="p-4 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-sm text-center">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">{label}</span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-[#FF2E54] dark:text-slate-300 dark:hover:text-[#FF2E54] text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

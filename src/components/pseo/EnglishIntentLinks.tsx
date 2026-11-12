import Link from 'next/link';
import { getEnglishGuidesForTool } from '@/config/english-pseo-index';
import { getPublishedPseoPage } from '@/config/pseo-publication';

export default function EnglishIntentLinks({ toolSlug, exclude }: { toolSlug: string; exclude?: string }) {
  const guides = getEnglishGuidesForTool(toolSlug).filter(guide => guide.slug !== exclude && getPublishedPseoPage('/p/' + guide.slug));
  if (!guides.length) return null;
  return (
    <section className="pt-4 pb-2" aria-label="Related conversion guides">
      <div className="p-4 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Related conversion guides</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {guides.map(guide => <Link key={guide.slug} href={'/p/' + guide.slug} className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-[#FF2E54] dark:text-slate-300 dark:hover:text-[#FF2E54] text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">{guide.label}</Link>)}
        </div>
      </div>
    </section>
  );
}

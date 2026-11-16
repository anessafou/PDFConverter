import { getToolContent } from '@/config/tool-content';
import { existingPathAlternates, pageMetadata } from '@/config/page-metadata';

import { requestLocale } from '@/locales/server';
import { translate } from '@/locales/translate';
import { localizePath } from '@/locales/routing';
// src/app/category/[categorySlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS_REGISTRY } from '@/config/tools-registry';

import { CATEGORY_SLUGS, getCategory } from '@/config/categories';
import Breadcrumbs, { categoryTrail } from '@/components/Breadcrumbs';

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const meta = getCategory(categorySlug);
  if (!meta) return {};

  const locale = await requestLocale();
  const title = translate(locale, meta.title);
  const description = translate(locale, meta.description);
  const languages = existingPathAlternates('/category/' + categorySlug);
  return pageMetadata(locale, title, description, languages[locale], languages);
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const locale = await requestLocale();
  const t = (value: string) => translate(locale, value);
  const linkTo = (href: string) => localizePath(href, locale);

  const { categorySlug } = await params;
  const meta = getCategory(categorySlug);
  if (!meta) notFound();

  const tools = Object.values(TOOLS_REGISTRY).filter((t) => t.category === categorySlug);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <Breadcrumbs locale={locale} trail={categoryTrail(locale, categorySlug, meta.name)} />

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t(meta.heading)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {t(meta.description)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={linkTo(`/${tool.slug}`)}
              className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t(tool.inputFormat.join(', ').replace(/\./g, ''))} &rarr; {t(tool.outputFormat.toUpperCase())}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF2E54] transition-colors mt-1">
                  {t(tool.name)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {getToolContent(tool, locale).description}
                </p>
              </div>
              <span className="text-xs font-bold text-[#FF2E54] mt-4 flex items-center gap-1">{t("Open Tool →")}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
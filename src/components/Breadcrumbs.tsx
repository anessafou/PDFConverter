import { Fragment } from 'react';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { getCategory } from '@/config/categories';
import { SITE_URL } from '@/config/page-metadata';
import type { Locale } from '@/config/i18n-registry';
import type { ToolDefinition } from '@/config/tools-registry';
import { localizePath } from '@/locales/routing';
import { translate } from '@/locales/translate';

type Crumb = { href: string; name: string };

export function categoryTrail(locale: Locale, slug: string, name: string): Crumb[] {
  return [
    { href: localizePath('/', locale), name: translate(locale, 'Home') },
    { href: localizePath('/category/' + slug, locale), name: translate(locale, name) },
  ];
}

export function toolTrail(locale: Locale, tool: ToolDefinition): Crumb[] {
  const category = getCategory(tool.category);
  return [
    ...(category
      ? categoryTrail(locale, tool.category, category.name)
      : [{ href: localizePath('/', locale), name: translate(locale, 'Home') }]),
    { href: localizePath('/' + tool.slug, locale), name: translate(locale, tool.name) },
  ];
}

export default function Breadcrumbs({
  locale, trail, centered = false,
}: { locale: Locale; trail: Crumb[]; centered?: boolean }) {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map(({ href, name }, index) => ({
          '@type': 'ListItem', position: index + 1, name,
          item: href === '/' ? SITE_URL : SITE_URL + href,
        })),
      }} />
      <nav
        aria-label={translate(locale, 'Breadcrumb')}
        className={`text-xs text-slate-400 flex flex-wrap items-center gap-2 ${centered ? 'justify-center' : ''}`}
      >
        {trail.map(({ href, name }, index) => (
          <Fragment key={href}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === trail.length - 1
              ? <span className="text-slate-600 dark:text-slate-300" aria-current="page">{name}</span>
              : <Link href={href} className="hover:underline">{name}</Link>}
          </Fragment>
        ))}
      </nav>
    </>
  );
}

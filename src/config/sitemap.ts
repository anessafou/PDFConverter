import { CATEGORY_SLUGS } from './categories';
import { generateHreflangAlternates, SUPPORTED_LOCALES } from './i18n-registry';
import { existingPathAlternates, SITE_URL } from './page-metadata';
import { getPublishedPseoPages } from './pseo-publication';
import { TOOLS_REGISTRY } from './tools-registry';

const CHUNK_SIZE = 1000;
const standaloneTools = ['view-documents-online', 'image-converter', 'markdown-editor'];
const supportPages = ['/privacy', '/terms', '/contact'];

export function coreSitemapUrls(): string[] {
  const tools = Object.keys(TOOLS_REGISTRY);
  return [
    ...SUPPORTED_LOCALES.map(locale => generateHreflangAlternates().languages[locale]),
    ...standaloneTools.map(slug => generateHreflangAlternates(slug).languages.en),
    ...supportPages.map(path => existingPathAlternates(path).en),
    ...tools.filter(slug => !standaloneTools.includes(slug)).map(slug => generateHreflangAlternates(slug).languages.en),
    ...SUPPORTED_LOCALES.filter(locale => locale !== 'en').flatMap(locale =>
      tools.map(slug => generateHreflangAlternates(slug).languages[locale]),
    ),
    ...SUPPORTED_LOCALES.flatMap(locale =>
      CATEGORY_SLUGS.map(slug => existingPathAlternates('/category/' + slug)[locale]),
    ),
  ];
}

export function sitemapIndexUrls(): string[] {
  const chunks = Math.ceil(getPublishedPseoPages().length / CHUNK_SIZE);
  return [
    SITE_URL + '/sitemap-core.xml',
    ...Array.from({ length: chunks }, (_, index) => SITE_URL + `/sitemap-${index + 1}.xml`),
  ];
}

export function pseoSitemapUrls(chunk: number): string[] {
  if (!Number.isSafeInteger(chunk) || chunk < 1) return [];
  const start = (chunk - 1) * CHUNK_SIZE;
  return getPublishedPseoPages().slice(start, start + CHUNK_SIZE).map(({ path }) => SITE_URL + path);
}

const xmlEntities: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
};

export function sitemapResponse(kind: 'sitemapindex' | 'urlset', urls: string[]) {
  const entry = kind === 'sitemapindex' ? 'sitemap' : 'url';
  const body = urls.map(url => `  <${entry}><loc>${url.replace(/[&<>"']/g, char => xmlEntities[char])}</loc></${entry}>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<${kind} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</${kind}>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

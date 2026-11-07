// src/app/sitemap-[id].xml/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { getLocalizedSlug, Locale } from '@/config/i18n-registry';
import { getAllPseoPaths } from '@/config/i18n-pseo';

const BASE_URL = 'https://www.pdfconverter.space';
const CHUNK_SIZE = 1000;

function wrapXml(urls: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryId = searchParams.get('id');
  const pathname = request.nextUrl.pathname;
  const match = pathname.match(/sitemap-([^/]+)\.xml/i);
  const id = queryId || (match ? match[1] : '1');

  // Core pages, tools, and all localized variants (/sitemap-core.xml)
  if (id === 'core') {
    // 1. Homepages (EN + FR + ES + DE + AR)
    const homepages = [
      { loc: `${BASE_URL}`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/fr`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/es`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/de`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/ar`, priority: '1.0', changefreq: 'daily' },
    ];

    // 2. Static pages
    const staticPages = [
      { loc: `${BASE_URL}/view-documents-online`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${BASE_URL}/image-converter`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${BASE_URL}/markdown-editor`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/contact`, priority: '0.6', changefreq: 'monthly' },
    ];

    // 3. English tools
    const englishToolPages = Object.values(TOOLS_REGISTRY)
      .filter(
        (tool) =>
          tool.slug !== 'view-documents-online' &&
          tool.slug !== 'markdown-editor' &&
          tool.slug !== 'image-converter'
      )
      .map((tool) => ({
        loc: `${BASE_URL}/${tool.slug}`,
        priority: '0.9',
        changefreq: 'weekly',
      }));

    // 4. Localized tool pages (FR, ES, DE, AR)
    const locales: Locale[] = ['fr', 'es', 'de', 'ar'];
    const localizedToolPages: { loc: string; priority: string; changefreq: string }[] = [];

    for (const loc of locales) {
      for (const tool of Object.values(TOOLS_REGISTRY)) {
        const locSlug = getLocalizedSlug(tool.slug, loc);
        localizedToolPages.push({
          loc: `${BASE_URL}/${loc}/${locSlug}`,
          priority: '0.8',
          changefreq: 'weekly',
        });
      }
    }

    const allCorePages = [
      ...homepages,
      ...staticPages,
      ...englishToolPages,
      ...localizedToolPages,
    ];

    const urlsXml = allCorePages
      .map(
        (p) => `
    <url>
      <loc>${p.loc}</loc>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`
      )
      .join('');

    return new NextResponse(wrapXml(urlsXml), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  // Handle pSEO sitemap chunks (English + FR + ES + DE + AR)
  const chunkIndex = parseInt(id, 10);
  if (isNaN(chunkIndex) || chunkIndex < 1) {
    return new NextResponse('Sitemap not found', { status: 404 });
  }

  const startIndex = (chunkIndex - 1) * CHUNK_SIZE;
  const allPaths = getAllPseoPaths();

  const pageSlice = allPaths.slice(startIndex, startIndex + CHUNK_SIZE);
  if (pageSlice.length === 0) {
    return new NextResponse('Sitemap not found', { status: 404 });
  }

  const urls = pageSlice
    .map(
      (path) => `
    <url>
      <loc>${BASE_URL}${path}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join('');

  return new NextResponse(wrapXml(urls), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
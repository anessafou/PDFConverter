// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { getAllPseoPaths } from '@/config/i18n-pseo';

const BASE_URL = 'https://www.pdfconverter.space';
const CHUNK_SIZE = 1000;

export async function GET() {
  const totalPseoPages = getAllPseoPaths().length;
  const totalChunks = CHUNK_SIZE > 0 ? Math.ceil(totalPseoPages / CHUNK_SIZE) : 0;
  const nowIso = new Date().toISOString();

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-core.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
  ${Array.from({ length: totalChunks })
    .map(
      (_, index) => `
  <sitemap>
    <loc>${BASE_URL}/sitemap-${index + 1}.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>`
    )
    .join('')}
</sitemapindex>`;

  return new NextResponse(sitemapIndexXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
import { NextRequest } from 'next/server';
import { coreSitemapUrls, pseoSitemapUrls, sitemapResponse } from '@/config/sitemap';

export function GET(request: NextRequest) {
  // Keep legacy rewrite and chunk ID handling. Only canonical child URLs appear in the index.
  const queryId = request.nextUrl.searchParams.get('id');
  const match = request.nextUrl.pathname.match(/sitemap-([^/]+)\.xml/i);
  const id = queryId || (match ? match[1] : '1');
  const urls = id === 'core' ? coreSitemapUrls() : pseoSitemapUrls(parseInt(id, 10));
  return urls.length
    ? sitemapResponse('urlset', urls)
    : new Response('Sitemap not found', { status: 404 });
}

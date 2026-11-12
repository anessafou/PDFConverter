import { sitemapIndexUrls, sitemapResponse } from '@/config/sitemap';

export function GET() {
  return sitemapResponse('sitemapindex', sitemapIndexUrls());
}

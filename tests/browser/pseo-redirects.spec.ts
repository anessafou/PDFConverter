import { test, expect } from '@playwright/test';
import baseline from '../../src/config/pseo-publication-baseline.json';

test('every published English pSEO URL stays published with its canonical and sitemap entry', async ({ request }) => {
  const sitemap = await request.get('/sitemap-1.xml');
  const first = [...(await sitemap.text()).matchAll(/<loc>https:\/\/www\.pdfconverter\.space([^<]+)<\/loc>/g)].map(match => match[1]);
  const sitemap2 = await request.get('/sitemap-2.xml');
  const second = [...(await sitemap2.text()).matchAll(/<loc>https:\/\/www\.pdfconverter\.space([^<]+)<\/loc>/g)].map(match => match[1]);
  const pseo = [...first, ...second];
  expect(pseo).toEqual(baseline.paths);
  const english = baseline.paths.filter(path => path.startsWith('/p/'));
  expect(english).toHaveLength(78);
  for (const path of english) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain('<link rel="canonical" href="https://www.pdfconverter.space' + path + '"');
    expect(html, path).toContain('name="robots" content="index, follow"');
  }
});

test('unmatched English pSEO slugs return 404 while verified legacy redirects still resolve', async ({ request }) => {
  for (const slug of [
    'pdf-to-word-unknown-audit-probe',
    'pdf-to-word-on-android',
    'image-converter-unknown-audit-probe',
    'pdf-to-scanned-document-unknown-audit-probe',
    'unknown-audit-probe',
  ]) {
    const response = await request.get('/p/' + slug, { maxRedirects: 0 });
    expect(response.status(), slug).toBe(404);
    expect(response.headers().location, slug).toBeUndefined();
  }
  for (const [source, destination, status] of [
    ['/pdf-to-scanned', '/pdf-to-scanned-document', 308],
    ['/sitemaps/core', '/sitemap-core.xml', 301],
    ['/sitemaps/1', '/sitemap-1.xml', 301],
    ['/sitemaps/2', '/sitemap-2.xml', 301],
  ] as const) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), source).toBe(status);
    expect(new URL(response.headers().location!, 'http://localhost').pathname, source).toBe(destination);
  }
});

test('localized published pSEO routes remain published in each locale', async ({ request }) => {
  for (const [locale, path] of [
    ['fr', '/fr/p/pdf-to-word-sur-mac'],
    ['es', '/es/p/pdf-to-word-en-mac'],
    ['de', '/de/p/pdf-to-word-fuer-mac'],
    ['ar', '/ar/p/pdf-to-word-for-mac'],
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html).toContain('<html lang="' + locale + '"');
    expect(html).toContain('<link rel="canonical" href="https://www.pdfconverter.space' + path + '"');
  }
});

import { test, expect } from '@playwright/test';
import baseline from '../../src/config/pseo-publication-baseline.json';

test('sitemaps retain every baseline URL, including all seven English task guides', async ({ request }) => {
  const paths: string[] = [];
  for (const chunk of [1, 2]) {
    const response = await request.get('/sitemap-' + chunk + '.xml');
    expect(response.status()).toBe(200);
    paths.push(...[...(await response.text()).matchAll(/<loc>https:\/\/www\.pdfconverter\.space([^<]+)<\/loc>/g)].map(match => match[1]));
  }
  expect(paths).toEqual(baseline.paths);
  expect(new Set(paths).size).toBe(1406);
});

test('retained questionable pages still render while hreflang only exposes real counterparts', async ({ page }) => {
  test.setTimeout(180000);
  for (const [locale, path] of [
    ['en', '/p/pdf-to-word-for-mac'], ['fr', '/fr/p/pdf-to-latex-sur-mac'],
    ['es', '/es/p/pdf-to-latex-en-mac'], ['de', '/de/p/pdf-to-latex-fuer-mac'], ['ar', '/ar/p/pdf-to-latex-for-mac'],
  ]) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('input[type=file]')).toBeAttached();
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.pdfconverter.space' + path);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'index, follow');
    const alternates = await page.locator('link[hreflang]').evaluateAll(nodes => nodes.map(node => ({ locale: node.getAttribute('hreflang'), href: node.getAttribute('href') })));
    for (const alternate of alternates) {
      if (alternate.locale === 'x-default') continue;
      expect(alternate.href).toContain('/p/');
      expect(baseline.paths).toContain(alternate.href!.replace('https://www.pdfconverter.space', ''));
    }
    if (locale !== 'en') expect(alternates.some(item => item.locale === 'en')).toBe(false);
    const footerGuides = await page.locator('footer a[href*="/p/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
    expect(footerGuides).toHaveLength(4);
    footerGuides.forEach(href => expect(baseline.paths).toContain(href));
  }
});

test('unapproved translated tasks and unmatched legacy English slugs return 404', async ({ request }) => {
  for (const locale of ['fr', 'es', 'de', 'ar']) {
    expect((await request.get('/' + locale + '/p/image-converter-images-to-ico')).status()).toBe(404);
  }
  const historical = await request.get('/p/pdf-to-word-unknown-audit-probe', { maxRedirects: 0 });
  expect(historical.status()).toBe(404);
  expect(historical.headers().location).toBeUndefined();
  expect((await request.get('/p/unknown-audit-probe')).status()).toBe(404);
});

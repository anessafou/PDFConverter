import { test, expect } from '@playwright/test';
import { getPseoLanguageAlternates } from '../../src/config/pseo-publication';
import { getLocalizedSlug, type Locale } from '../../src/config/i18n-registry';
import { translate } from '../../src/locales/translate';

const site = 'https://www.pdfconverter.space';
const guides = [
  ['en', '/p/pdf-to-word-for-mac', 'en_US'],
  ['fr', '/fr/p/pdf-to-word-sur-mac', 'fr_FR'],
  ['es', '/es/p/pdf-to-word-en-mac', 'es_ES'],
  ['de', '/de/p/pdf-to-word-fuer-mac', 'de_DE'],
  ['ar', '/ar/p/pdf-to-word-for-mac', 'ar_SA'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
});

test('published guides render server locale attributes and reciprocal social and search metadata', async ({ page, request }) => {
  test.setTimeout(180000);
  for (const [locale, path, socialLocale] of guides) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(new RegExp('<html\\b[^>]*lang="' + locale + '"[^>]*dir="' + (locale === 'ar' ? 'rtl' : 'ltr') + '"'));
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', socialLocale);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', site + path);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description!);
    for (const [language, url] of Object.entries(getPseoLanguageAlternates(path))) {
      await expect(page.locator('link[hreflang="' + language + '"]')).toHaveAttribute('href', url);
    }
    if (locale !== 'en') {
      const h1 = await page.locator('h1').innerText();
      expect(await page.title()).toBe(h1 + ' | PDFConverter');
      expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toContainEqual(
        JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', url: site + path, name: h1, inLanguage: locale }),
      );
    }
  }
});

test('the language selector updates language and direction through client navigation', async ({ page }) => {
  await page.goto(guides[1][1], { waitUntil: 'domcontentloaded' });
  await expect.poll(async () => (await page.context().cookies()).find(cookie => cookie.name === 'NEXT_LOCALE')?.value).toBe('fr');
  for (const [from, to, label, path] of [
    ['fr', 'ar', 'العربية', guides[4][1]],
    ['ar', 'en', 'English', guides[0][1]],
  ] as const) {
    await page.getByRole('button', { name: translate(from, 'Select Language') }).click();
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.locator('html')).toHaveAttribute('lang', to);
    await expect(page.locator('html')).toHaveAttribute('dir', to === 'ar' ? 'rtl' : 'ltr');
  }
});

test('existing home, category, support and utility pages link back to each language equivalent', async ({ page }) => {
  test.setTimeout(180000);
  for (const [english, german] of [
    ['/', '/de'],
    ['/category/document', '/de/category/document'],
    ['/privacy', '/de/privacy'],
    ['/image-converter', '/de/' + getLocalizedSlug('image-converter', 'de')],
  ]) {
    for (const [path, locale, og] of [[english, 'en', 'en_US'], [german, 'de', 'de_DE']] as const) {
      await page.context().clearCookies();
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', og);
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', site + (english === '/' ? '' : english));
      await expect(page.locator('link[hreflang="de"]')).toHaveAttribute('href', site + german);
      if (english === '/') {
        expect(await page.locator('script[type="application/ld+json"]').allTextContents()).not.toEqual(
          expect.arrayContaining([expect.stringContaining('aggregateRating')]),
        );
      }
      if (english === '/image-converter' && locale === 'de') {
        const key = 'PNG with transparency support';
        await expect(page.getByText(translate(locale as Locale, key), { exact: false })).toBeVisible();
      }
    }
  }
});

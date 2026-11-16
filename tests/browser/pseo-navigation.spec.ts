import { test, expect } from '@playwright/test';
import { CATEGORY_SLUGS, getCategory } from '../../src/config/categories';
import { SUPPORTED_LOCALES, generateHreflangAlternates } from '../../src/config/i18n-registry';
import { SITE_URL } from '../../src/config/page-metadata';
import { getPublishedPseoPages } from '../../src/config/pseo-publication';
import { translate } from '../../src/locales/translate';

test('sitemap index and children are valid XML and list the existing canonical hubs once', async ({ page, request }) => {
  const read = async (path: string, root: string) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');
    const xml = await page.evaluate(source => {
      const doc = new DOMParser().parseFromString(source, 'application/xml');
      return {
        root: doc.documentElement.localName,
        namespace: doc.documentElement.namespaceURI,
        locs: Array.from(doc.getElementsByTagName('loc'), node => node.textContent),
        error: doc.getElementsByTagName('parsererror').length,
        lastmod: doc.getElementsByTagName('lastmod').length,
      };
    }, await response.text());
    expect(xml).toMatchObject({ root, namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9', error: 0, lastmod: 0 });
    return xml.locs;
  };
  const index = await read('/sitemap.xml', 'sitemapindex');
  expect(index).toEqual(['core', '1', '2'].map(id => SITE_URL + '/sitemap-' + id + '.xml'));
  const core = await read('/sitemap-core.xml', 'urlset');
  const first = await read('/sitemap-1.xml', 'urlset');
  const second = await read('/sitemap-2.xml', 'urlset');
  expect([core.length, first.length, second.length]).toEqual([463, 1000, 406]);
  expect(new Set([...core, ...first, ...second]).size).toBe(1869);
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of CATEGORY_SLUGS) {
      expect(core).toContain(SITE_URL + (locale === 'en' ? '' : '/' + locale) + '/category/' + slug);
    }
  }
  expect((await request.get('/sitemap-3.xml', { maxRedirects: 0 })).status()).toBe(404);
});

test('localized tool and guide breadcrumbs link to canonical hubs and each other on mobile', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
  const tool = 'pdf-to-word';
  for (const locale of SUPPORTED_LOCALES) {
    const toolUrl = generateHreflangAlternates(tool).languages[locale];
    const published = getPublishedPseoPages(locale).filter(item => item.toolSlug === tool && item.intent.kind === 'platform');
    const guide = published.find(item => item.intent.kind === 'platform' && item.intent.modifier === 'for-mac')!;
    const home = locale === 'en' ? '/' : '/' + locale;
    const hub = (locale === 'en' ? '' : '/' + locale) + '/category/pdf-to';
    const parent = toolUrl.slice(SITE_URL.length);
    await page.context().clearCookies();
    expect((await page.goto(guide.path, { waitUntil: 'domcontentloaded' }))?.status()).toBe(200);
    const breadcrumb = page.getByRole('navigation', { name: translate(locale, 'Breadcrumb'), exact: true });
    await expect(breadcrumb.getByRole('link')).toHaveCount(3);
    expect(await breadcrumb.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([home, hub, parent]);
    await expect(breadcrumb.locator('[aria-current=page]')).toBeVisible();
    const visibleNames = await breadcrumb.getByRole('link').allTextContents();
    visibleNames.push(await breadcrumb.locator('[aria-current=page]').innerText());
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(value => JSON.parse(value));
    const items = schemas.find(value => value['@type'] === 'BreadcrumbList').itemListElement;
    expect(items.map((item: { item: string }) => item.item)).toEqual([
      SITE_URL + (home === '/' ? '' : home), SITE_URL + hub, toolUrl, SITE_URL + guide.path,
    ]);
    expect(items.map((item: { name: string }) => item.name)).toEqual(visibleNames);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await breadcrumb.locator('a').last().click();
    await expect(page).toHaveURL(new RegExp(parent + '$'));
    const guideArea = locale === 'en'
      ? page.locator('main')
      : page.getByRole('navigation', { name: translate(locale, 'Specialized Guides & Platforms:'), exact: true });
    for (const { path } of published) await expect(guideArea.locator('a[href="' + path + '"]')).toBeVisible();
    await breadcrumb.locator('a[href="' + hub + '"]').click();
    await expect(page).toHaveURL(new RegExp(hub + '$'));
    const categoryHeading = getCategory('pdf-to')!.heading;
    await expect(page.locator('main h1')).toHaveText(translate(locale, categoryHeading));
    const targetCanonical = page.locator(`link[rel="canonical"][href="${SITE_URL + hub}"]`);
    await expect(targetCanonical).toHaveCount(1);
    await expect(page.locator('main a[href="' + parent + '"]')).toBeVisible();

    // Confirm the same localized canonical is present on a fresh direct load too.
    expect((await page.goto(hub, { waitUntil: 'domcontentloaded' }))?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL + hub);
  }
});

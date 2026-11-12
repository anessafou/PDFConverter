import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { PDFDocument, degrees } from 'pdf-lib';
import { ENGLISH_INTENT_INDEX } from '../../src/config/english-pseo-index';
import { getEnglishIntentPage } from '../../src/config/english-pseo-content';

async function downloadButton(page: Page, name: string) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name, exact: true }).click();
  return readFile((await (await pending).path())!);
}
async function pngFixture(page: Page, width = 6, height = 4) {
  return Buffer.from(await page.evaluate(({ width, height }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = 'rgba(230,60,80,0.5)'; ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { width, height }), 'base64');
}
async function imageExport(page: Page, slug: string, target: string, name: string, mimeType: string, buffer: Buffer) {
  await page.goto('/p/' + slug);
  await page.locator('input[type=file]').setInputFiles({ name, mimeType, buffer });
  await page.getByRole('button', { name: 'Convert All to ' + target, exact: true }).click();
  await expect(page.getByText('✓ Converted', { exact: true })).toBeVisible();
  return downloadButton(page, 'Download');
}

test('all new pages have server content, unique SEO, canonical links and one H1', async ({ page, request }) => {
  test.setTimeout(180000);
  for (const index of ENGLISH_INTENT_INDEX) {
    const content = getEnglishIntentPage(index.slug)!;
    const response = await request.get('/p/' + index.slug);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(content.h1);
    await page.goto('/p/' + index.slug);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main main')).toHaveCount(0);
    await expect(page).toHaveTitle(content.title);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', content.description);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.pdfconverter.space/p/' + index.slug);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('link[hreflang=fr]')).toHaveCount(0);
    expect(await page.locator('main a[href="/' + index.toolSlug + '"]').count()).toBeGreaterThan(0);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.map(text => JSON.parse(text)['@type'])).toEqual(expect.arrayContaining(['BreadcrumbList', 'WebApplication']));
    const application = schemas.map(text => JSON.parse(text)).find(item => item['@type'] === 'WebApplication');
    const webPage = schemas.map(text => JSON.parse(text)).find(item => item['@type'] === 'WebPage');
    expect(application.url).toBe('https://www.pdfconverter.space/' + index.toolSlug);
    expect(webPage.url).toBe('https://www.pdfconverter.space/p/' + index.slug);
  }
  const sitemap1 = await (await request.get('/sitemap-1.xml')).text();
  const sitemap2 = await (await request.get('/sitemap-2.xml')).text();
  for (const index of ENGLISH_INTENT_INDEX) expect(sitemap1 + sitemap2).toContain('/p/' + index.slug + '</loc>');
  const parent = await (await request.get('/image-converter')).text();
  expect(parent).toContain('/p/image-converter-images-to-ico');
  const legacy = await request.get('/p/pdf-to-jpg-on-iphone');
  expect(legacy.status()).toBe(200);
  expect(await legacy.text()).toContain('PDF to JPG');
});

test('US priority platform and core pages render their specific guidance without changing SEO routes', async ({ page }) => {
  const platformPages = [
    { path: '/p/pdf-to-jpg-on-iphone', title: 'PDF to JPG on iPhone - Free Online Converter | PDFConverter', faq: 'How do I convert a PDF to JPG on iPhone?', fact: 'one JPG per page' },
    { path: '/p/pdf-to-jpg-for-windows', title: 'PDF to JPG for Windows - Free Online Converter | PDFConverter', faq: 'How do I convert PDF to JPG on Windows?', fact: 'page-range selector' },
    { path: '/p/jpg-to-pdf-on-iphone', title: 'JPG to PDF on iPhone - Free Online Converter | PDFConverter', faq: 'Can I combine several iPhone photos into one PDF?', fact: 'one-page PDF' },
    { path: '/p/merge-pdf-for-windows', title: 'Merge PDF for Windows - Free Online Converter | PDFConverter', faq: 'How many PDFs can I merge at once?', fact: 'no visual reorder control' },
    { path: '/p/merge-pdf-on-iphone', title: 'Merge PDF on iPhone - Free Online Converter | PDFConverter', faq: 'Can I merge PDFs stored in the Files app?', fact: '2–20 PDFs' },
    { path: '/p/merge-pdf-without-watermark', title: 'Merge PDFs Without Adding a Watermark | PDFConverter', h1: 'Merge PDFs without adding a watermark', faq: 'Does merging these PDFs add a watermark?', fact: 'does not add a new watermark' },
    { path: '/p/rotate-pdf-on-iphone', title: 'Rotate PDF on iPhone - Free Online Converter | PDFConverter', faq: 'Can I rotate just one page?', fact: '90° clockwise' },
    { path: '/p/split-pdf-for-windows', title: 'Split PDF for Windows - Free Online Converter | PDFConverter', faq: 'Can I split only selected pages?', fact: 'one PDF for every page' },
  ];
  for (const item of platformPages) {
    const response = await page.goto(item.path);
    expect(response?.status(), item.path).toBe(200);
    await expect(page).toHaveTitle(item.title);
    await expect(page.locator('h1')).toHaveCount(1);
    if (typeof item.h1 === 'string') await expect(page.locator('h1')).toHaveText(item.h1);
    await expect(page.getByRole('heading', { name: item.faq, exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText(item.fact);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.pdfconverter.space' + item.path);
    await expect(page.locator('link[rel=alternate][hreflang=fr]')).toHaveAttribute('href', /^https:\/\/www\.pdfconverter\.space\/fr\/p\//);
    if (item.path.startsWith('/p/merge-pdf-')) {
      await expect(page.locator('nav[aria-label="Breadcrumb"] a[href="/merge-pdf"]')).toHaveCount(1);
    }
  }

  const corePages = [
    { path: '/pdf-to-jpg', faq: 'Can I convert only selected PDF pages?' },
    { path: '/pdf-to-png', faq: 'Can I select a page range?' },
    { path: '/merge-pdf', faq: 'Can I reorder files after selecting them?' },
    { path: '/rotate-pdf', faq: 'Can I rotate one page or choose another angle?' },
    { path: '/split-pdf', faq: 'Can I extract only a page range?' },
  ];
  for (const item of corePages) {
    const response = await page.goto(item.path);
    expect(response?.status(), item.path).toBe(200);
    await expect(page.getByRole('heading', { name: item.faq, exact: true })).toBeVisible();
  }
});

test('new layouts fit mobile and desktop widths without page overflow', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const index of ENGLISH_INTENT_INDEX) {
      await page.goto('/p/' + index.slug);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      expect(overflow, index.slug + ' at ' + width).toBe(false);
      if (index.slug === 'image-converter-images-to-ico' || index.slug === 'image-converter-image-format-comparison') {
        await page.screenshot({ path: testInfo.outputPath(index.slug + '-' + width + '.png'), fullPage: width === 390 });
      }
    }
  }
});

test('ICO export creates a single PNG-backed icon within 256 pixels', async ({ page }) => {
  await page.goto('/image-converter');
  const input = await pngFixture(page, 512, 512);
  const output = await imageExport(page, 'image-converter-images-to-ico', 'ICO', 'icon.png', 'image/png', input);
  expect(output.readUInt16LE(2)).toBe(1);
  expect(output.readUInt16LE(4)).toBe(1);
  const offset = output.readUInt32LE(18);
  expect(output.subarray(offset, offset + 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(output.readUInt32BE(offset + 16)).toBe(256);
  expect(output.readUInt32BE(offset + 20)).toBe(256);
});

test('BMP export is 24-bit and its pixels can be converted back to PNG', async ({ page }) => {
  await page.goto('/image-converter');
  const input = await pngFixture(page);
  const bitmap = await imageExport(page, 'image-converter-images-to-bmp', 'BMP', 'alpha.png', 'image/png', input);
  expect(bitmap.subarray(0, 2).toString()).toBe('BM');
  expect(bitmap.readUInt16LE(28)).toBe(24);
  expect(bitmap.readUInt32LE(18)).toBe(6);
  const pixelOffset = bitmap.readUInt32LE(10);
  // Half-transparent red was composited over white; no alpha channel is claimed.
  expect(bitmap[pixelOffset + 2]).toBeGreaterThan(240);
  const png = await imageExport(page, 'image-converter-bmp-to-png', 'PNG', 'source.bmp', 'image/bmp', bitmap);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(6);
  expect(png.readUInt32BE(20)).toBe(4);
});

test('SVG artwork is rasterized into WebP and BMP, without a vector-output claim', async ({ page }) => {
  const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="6" height="4"><rect width="3" height="4" fill="red"/></svg>');
  const webp = await imageExport(page, 'image-converter-svg-to-webp', 'WEBP', 'source.svg', 'image/svg+xml', input);
  expect(webp.subarray(0, 4).toString()).toBe('RIFF');
  expect(webp.subarray(8, 12).toString()).toBe('WEBP');
  const bmp = await imageExport(page, 'image-converter-images-to-bmp', 'BMP', 'source.svg', 'image/svg+xml', input);
  expect(bmp.subarray(0, 2).toString()).toBe('BM');
  expect(bmp.readUInt32LE(18)).toBe(6);
});

test('batch WebP download contains separate valid PNG outputs', async ({ page }) => {
  // Serve the installed ZIP library locally; this tests archive behavior, not CDN uptime.
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', route => route.fulfill({ path: require.resolve('jszip/dist/jszip.min.js'), contentType: 'application/javascript' }));
  await page.goto('/p/image-converter-batch-webp-conversion');
  const webp = Buffer.from(await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 6; c.height = 4; return c.toDataURL('image/webp').split(',')[1]; }), 'base64');
  await page.locator('input[type=file]').setInputFiles([{ name: 'first.webp', mimeType: 'image/webp', buffer: webp }, { name: 'second.webp', mimeType: 'image/webp', buffer: webp }]);
  await page.getByRole('button', { name: 'Convert All to PNG', exact: true }).click();
  await expect(page.getByText('✓ Converted', { exact: true })).toHaveCount(2);
  const bytes = await downloadButton(page, 'Download All as .ZIP (2)');
  const zip = await JSZip.loadAsync(bytes);
  expect(Object.keys(zip.files).sort()).toEqual(['first.png', 'second.png']);
  for (const file of Object.values(zip.files)) expect((await file.async('nodebuffer')).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
});

test('saved rotation adds 90 degrees to every page in the downloaded PDF', async ({ page }) => {
  const input = await PDFDocument.create();
  input.addPage([400, 300]); input.addPage([400, 300]).setRotation(degrees(90));
  await page.goto('/p/rotate-pdf-save-rotation');
  await page.locator('input[type=file]').setInputFiles({ name: 'source.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await input.save()) });
  await page.getByRole('button', { name: 'Convert to PDF Now', exact: true }).click();
  await expect(page.getByText('Conversion Successful!', { exact: true })).toBeVisible({ timeout: 20000 });
  const output = await PDFDocument.load(await downloadButton(page, 'Download File'));
  expect(output.getPages().map(p => p.getRotation().angle)).toEqual([90, 180]);
});

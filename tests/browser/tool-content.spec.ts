import { expect, test } from '@playwright/test';
import { resolvePublishedPseo, getPublishedPseoCounterpart } from '../../src/config/pseo-publication';
import { generateHreflangAlternates, SUPPORTED_LOCALES } from '../../src/config/i18n-registry';
import { TOOLS_REGISTRY } from '../../src/config/tools-registry';
import { DICTIONARIES } from '../../src/locales/dictionaries';
import { getEnglishCoreToolGuide } from '../../src/config/english-core-tool-content';

test('localized guides show the relevant result, device workflow and processing disclosure', async ({ page }) => {
  test.setTimeout(180000);
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
  const french = resolvePublishedPseo('fr', 'split-pdf-sur-mac')!;
  await page.goto(french.path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Puis-je extraire une plage de pages ?' })).toBeVisible();
  await expect(page.getByText(/une archive ZIP contenant un PDF par page/)).toBeVisible();
  const german = getPublishedPseoCounterpart(french.path, 'de')!;
  await page.goto(german.path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/PDF pro Seite/)).toBeVisible();
  const spanish = resolvePublishedPseo('es', 'word-to-pdf-en-iphone')!;
  await page.goto(spanish.path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/envía el archivo seleccionado a un servicio de conversión/)).toBeVisible();
  await expect(page.getByRole('heading', { name: '¿Cómo elijo y guardo un archivo en iPhone?' })).toBeVisible();
  const arabic = resolvePublishedPseo('ar', 'pdf-to-word-without-watermark')!;
  await page.goto(arabic.path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'هل يمكن إزالة علامة مائية بهذه الأداة؟' })).toBeVisible();
});

test('Merge PDF explains browser-provided file order on every localized core tool page', async ({ page }) => {
  const urls = generateHreflangAlternates('merge-pdf').languages;
  const tool = TOOLS_REGISTRY['merge-pdf'];
  for (const locale of SUPPORTED_LOCALES) {
    const path = new URL(urls[locale]).pathname;
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    const visibleCopy = locale === 'en'
      ? getEnglishCoreToolGuide(tool.slug)!.introduction
      : DICTIONARIES[locale].tools[tool.slug].description;
    await expect(page.getByText(visibleCopy, { exact: true }).first()).toBeVisible();
  }
});

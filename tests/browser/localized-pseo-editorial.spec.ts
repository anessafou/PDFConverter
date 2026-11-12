import { test, expect } from '@playwright/test';
import { getPseoLanguageAlternates, getPublishedPseoPage } from '../../src/config/pseo-publication';
import { localizedPseoHeading } from '../../src/config/localized-pseo-metadata';
import { getToolContent } from '../../src/config/tool-content';
import { TOOLS_REGISTRY } from '../../src/config/tools-registry';
import { getLocalizedPseoEditorial, LOCALIZED_PSEO_EDITORIAL_PATHS } from '../../src/config/localized-pseo-editorial';

const targets = [
  { path: '/de/p/pdf-to-jpg-fuer-windows', locale: 'de', tool: 'pdf-to-jpg', modifier: 'for-windows' },
  { path: '/de/p/merge-pdf-fuer-windows', locale: 'de', tool: 'merge-pdf', modifier: 'for-windows' },
  { path: '/de/p/merge-pdf-auf-dem-iphone', locale: 'de', tool: 'merge-pdf', modifier: 'on-iphone' },
  { path: '/fr/p/merge-pdf-sur-iphone', locale: 'fr', tool: 'merge-pdf', modifier: 'on-iphone' },
] as const;
const site = 'https://www.pdfconverter.space';

test('four localized editorial pages render the guides, retained FAQs, canonicals and hreflang', async ({ page }) => {
  for (const target of targets) {
    const editorial = getLocalizedPseoEditorial(target.locale, target.tool, target.modifier)!;
    const response = await page.goto(target.path);
    expect(response?.status(), target.path).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(localizedPseoHeading(target.locale, target.tool, target.modifier));
    await expect(page.locator('body')).toContainText(editorial.intro);
    await expect(page.getByRole('heading', { name: editorial.heading, exact: true })).toBeVisible();
    for (const step of editorial.steps) {
      const item = page.locator('ol li').filter({ hasText: step.title });
      await expect(item).toHaveCount(1);
      await expect(item).toBeVisible();
      await expect(item).toContainText(step.description);
    }
    await expect(page.getByRole('heading', { name: editorial.outputHeading, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: editorial.limitationsHeading, exact: true })).toBeVisible();

    const publication = getPublishedPseoPage(target.path)!;
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', site + target.path);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    const alternates = getPseoLanguageAlternates(target.path);
    for (const [locale, href] of Object.entries(alternates)) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveAttribute('href', href);
    }
    const tool = TOOLS_REGISTRY[publication.toolSlug];
    const existing = getToolContent(tool, target.locale, target.modifier);
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions|Häufig gestellte Fragen|Foire Aux Questions/i })).toBeVisible();
    for (const faq of existing.faqs) {
      await expect(page.getByRole('heading', { name: faq.q, exact: true })).toBeVisible();
      await expect(page.locator('body')).toContainText(editorial.faqAnswerOverrides?.[faq.q] ?? faq.a);
    }
    if (editorial.relatedLink) {
      await expect(page.locator(`a[href="${editorial.relatedLink.href}"]`)).toHaveText(editorial.relatedLink.label);
    }
  }
});

test('localized content preserves mobile page width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of LOCALIZED_PSEO_EDITORIAL_PATHS) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true);
  }
});

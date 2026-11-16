import { test, expect } from '@playwright/test';
import { generateHreflangAlternates } from '../../src/config/i18n-registry';
import { getEnglishCoreToolGuide } from '../../src/config/english-core-tool-content';
import { DICTIONARIES } from '../../src/locales/dictionaries';

const site = 'https://www.pdfconverter.space';
const targets = [
  ['pdf-to-jpg', 'PDF to JPG'],
  ['merge-pdf', 'Merge PDF'],
  ['pdf-to-png', 'PDF to PNG'],
  ['split-pdf', 'Split PDF'],
  ['rotate-pdf', 'Rotate PDF'],
] as const;

function attribute(tag: string, name: string) {
  return tag.match(new RegExp('\\b' + name + '="([^"]*)"', 'i'))?.[1] ?? null;
}

test('five core-tool guides are present in server-rendered HTML with unchanged canonical and hreflang', async ({ request }) => {
  for (const [slug, h1] of targets) {
    const path = '/' + slug;
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const guide = getEnglishCoreToolGuide(slug)!;
    const renderedH1 = html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]+>/g, '').trim();
    expect(renderedH1).toBe(h1);
    expect(html).toContain(guide.introduction);
    expect(html).toContain(guide.heading);
    for (const step of guide.steps) {
      expect(html).toContain(step.title);
      expect(html).toContain(step.body);
    }
    expect(html).toContain(guide.guidance);
    expect(html).toContain('Frequently Asked Questions');
    for (const faq of DICTIONARIES.en.tools[slug].faqs ?? []) {
      expect(html).toContain(faq.q);
      expect(html).toContain(faq.a);
    }
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
    const canonical = links.find(tag => attribute(tag, 'rel') === 'canonical');
    expect(canonical).toBeTruthy();
    expect(attribute(canonical!, 'href')).toBe(site + path);
    expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/i);
    for (const [locale, href] of Object.entries(generateHreflangAlternates(slug).languages)) {
      const alternate = links.find(tag => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hreflang') === locale);
      expect(alternate, path + ' alternate ' + locale).toBeTruthy();
      expect(attribute(alternate!, 'href')).toBe(href);
    }
  }
});

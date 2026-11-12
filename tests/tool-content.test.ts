import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getToolContent } from '../src/config/tool-content';
import { TOOLS_REGISTRY } from '../src/config/tools-registry';
import { SUPPORTED_LOCALES } from '../src/config/i18n-registry';
import { getPublishedPseoPages } from '../src/config/pseo-publication';

test('tool copy distinguishes local outputs, conditional formats and server uploads', () => {
  const copy = (slug: string) => getToolContent(TOOLS_REGISTRY[slug], 'en');
  assert.match(copy('word-to-pdf').description, /uploads.*conversion service/);
  assert.match(copy('heic-to-jpg').faqs[1].a, /can decode the input/);
  assert.match(copy('split-pdf').description, /ZIP containing one PDF for every page/);
  assert.match(copy('rotate-pdf').description, /every page 90° clockwise/);
  assert.match(copy('pdf-to-txt').description, /does not recognize text inside scanned images/);
  assert.match(copy('svg-to-pdf').description, /one PDF page.*raster/);
  assert.match(copy('xlsx-to-csv').description, /one CSV per sheet/);
});

test('published platform guides have locale-specific answers without unresolved format placeholders', () => {
  for (const page of getPublishedPseoPages()) {
    if (page.intent.kind !== 'platform') continue;
    const tool = TOOLS_REGISTRY[page.toolSlug];
    const content = getToolContent(tool, page.locale, page.intent.modifier);
    assert.equal(content.faqs.length, 3);
    assert.ok(content.formats.includes(tool.inputFormat[0]));
    assert.ok(content.formats.includes(tool.outputFormat.toUpperCase()));
    assert.doesNotMatch(JSON.stringify(content), /\{(?:input|output)\}|100\s*(?:MB|Mo)|60 minutes|DSGVO|RGPD/);
  }
  const pdf = TOOLS_REGISTRY['merge-pdf'];
  for (const locale of SUPPORTED_LOCALES) {
    const variants = ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'] as const;
    assert.equal(new Set(variants.map(variant => getToolContent(pdf, locale, variant).faqs[2].a)).size, 4);
  }
});

import { getPlatformContent } from '../src/config/english-platform-content';
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

test('priority tools have distinct localized output guidance and honest availability', () => {
  const slugs = ['protect-pdf', 'unlock-pdf', 'pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt',
    'split-pdf', 'rotate-pdf', 'pdf-to-markdown', 'pdf-to-html'];
  for (const locale of SUPPORTED_LOCALES) {
    const answers = slugs.map(slug => getToolContent(TOOLS_REGISTRY[slug], locale, 'for-mac').faqs[0].a);
    assert.equal(new Set(answers).size, slugs.length);
    for (const slug of slugs.slice(0, 5)) {
      const content = getToolContent(TOOLS_REGISTRY[slug], locale, 'on-iphone');
      assert.ok(content.availability);
      if (locale !== 'en') assert.notEqual(content.availability, getToolContent(TOOLS_REGISTRY[slug], 'en').availability);
      assert.doesNotMatch(content.description, /AES-128|AES-256/);
    }
    assert.equal(getToolContent(TOOLS_REGISTRY['heic-to-jpg'], locale).availability, undefined);
  }
});

test('device guidance uses relevant file selection and download instructions', () => {
  const tool = TOOLS_REGISTRY['pdf-to-word'];
  assert.match(getPlatformContent(tool, 'for-windows').steps[0].desc, /File Explorer/);
  assert.match(getPlatformContent(tool, 'for-mac').steps[0].desc, /Finder/);
  assert.match(getPlatformContent(tool, 'on-iphone').steps[0].desc, /Files/);
  assert.doesNotMatch(getPlatformContent(tool, 'on-iphone').steps[0].desc, /Photos/);
  assert.match(getPlatformContent(tool, 'on-iphone').steps[2].desc, /If the service returns/);
});

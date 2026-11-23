import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ENGLISH_SERVICE_EDITORIAL } from '../src/config/english-service-editorial';
import { DICTIONARIES } from '../src/locales/dictionaries';
import { getEnglishCoreToolGuide } from '../src/config/english-core-tool-content';
import { getPlatformContent } from '../src/config/english-platform-content';
import { TOOLS_REGISTRY, REGISTERED_TOOL_COUNT } from '../src/config/tools-registry';
import { coreSitemapUrls, pseoSitemapUrls } from '../src/config/sitemap';

test('service editorial survives shared dictionary generation and exposes useful steps', () => {
  for (const [slug, copy] of Object.entries(ENGLISH_SERVICE_EDITORIAL)) {
    assert.equal(DICTIONARIES.en.tools[slug].description, copy.description);
    assert.equal(DICTIONARIES.en.tools[slug].h1, copy.h1);
    assert.equal(DICTIONARIES.en.tools[slug].title, copy.title);
    assert.equal(getEnglishCoreToolGuide(slug)?.steps.length, 3);
    assert.equal(copy.faqs.length, 5);
    assert.doesNotMatch(copy.description, /Input:|Output:|perfect|100 MB/);
    assert.match(copy.description, /service/);
  }
  assert.equal(REGISTERED_TOOL_COUNT, 86);
});

test('watermark guide explains backend limits and source marks with task-specific steps', () => {
  const copy = getPlatformContent(TOOLS_REGISTRY['pdf-to-word'], 'without-watermark');
  assert.equal(copy.steps.length, 3);
  assert.doesNotMatch(JSON.stringify(copy.steps), /Choose a supported source|Run the supported operation/);
  assert.match(copy.steps[2].desc, /letterhead/);
  assert.ok(copy.faqs.some(f => /adds? its own watermark/.test(f.q)));
  assert.equal(coreSitemapUrls().length, 463);
  assert.equal(pseoSitemapUrls(1).length + pseoSitemapUrls(2).length, 1406);
});

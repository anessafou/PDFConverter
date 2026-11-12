import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { getAllPseoPaths } from '../src/config/i18n-pseo';
import { getEnglishCoreToolGuide } from '../src/config/english-core-tool-content';
import { generateHreflangAlternates, SUPPORTED_LOCALES } from '../src/config/i18n-registry';
import { DICTIONARIES } from '../src/locales/dictionaries';
import { TOOLS_REGISTRY } from '../src/config/tools-registry';

const expected = {
  'pdf-to-jpg': { h1: 'PDF to JPG', keyword: 'PDF to JPG', markers: ['25 MB', '40 megapixels', 'ZIP', 'every page'] },
  'merge-pdf': { h1: 'Merge PDF', keyword: 'merge PDF', markers: ['2–20', '25 MB', 'no more than 20', 'order'] },
  'pdf-to-png': { h1: 'PDF to PNG', keyword: 'PDF to PNG', markers: ['25 MB', '40 megapixels', 'ZIP', 'raster image'] },
  'split-pdf': { h1: 'Split PDF', keyword: 'split(?: a)? PDF', markers: ['25 MB', 'ZIP', 'one PDF', 'page range'] },
  'rotate-pdf': { h1: 'Rotate PDF', keyword: 'Rotate PDF', markers: ['25 MB', '90° clockwise', 'every page', 'angle controls'] },
} as const;

test('the five selected English core tools have distinct, practical, capability-matched guides', () => {
  const slugs = Object.keys(expected);
  const introductions = new Set<string>();
  for (const [slug, requirement] of Object.entries(expected)) {
    const guide = getEnglishCoreToolGuide(slug)!;
    assert.ok(guide, slug + ' guide exists');
    assert.match(guide.heading, new RegExp(requirement.keyword, 'i'));
    assert.match(guide.introduction, new RegExp(requirement.keyword, 'i'));
    assert.ok(guide.steps.length >= 3 && guide.steps.length <= 5, slug + ' has 3–5 steps');
    const content = JSON.stringify(guide);
    for (const marker of requirement.markers) assert.ok(content.toLowerCase().includes(marker.toLowerCase()), slug + ' includes ' + marker);
    introductions.add(guide.introduction);
  }
  assert.equal(introductions.size, slugs.length, 'each tool has its own introduction');
  assert.equal(getEnglishCoreToolGuide('compress-pdf'), null, 'scope excludes other tools');
});

test('the core content addition preserves existing English metadata and all published routes/tools', () => {
  const expectedEnglish = {
    'pdf-to-jpg': ['PDF to JPG - PDFConverter', 'PDF to JPG', 'Input: .pdf. Output: JPG. Each complete page is rendered as JPG. A one-page PDF yields an image. Multiple pages yield a ZIP, with a combined rendering limit of 40 megapixels.'],
    'merge-pdf': ['Merge PDF - PDFConverter', 'Merge PDF', 'Input: .pdf. Output: PDF. The merge uses the file order supplied by the browser. It is not guaranteed to match the order in which you select files, and you cannot reorder files after selection.'],
    'pdf-to-png': ['PDF to PNG - PDFConverter', 'PDF to PNG', 'Input: .pdf. Output: PNG. Each complete page is rendered as PNG. A one-page PDF yields an image. Multiple pages yield a ZIP, with a combined rendering limit of 40 megapixels.'],
    'split-pdf': ['Split PDF - PDFConverter', 'Split PDF', 'Input: .pdf. Output: PDF. Download a ZIP containing one PDF for every page. The interface does not let you select a page range.'],
    'rotate-pdf': ['Rotate PDF - PDFConverter', 'Rotate PDF', 'Input: .pdf. Output: PDF. The button rotates every page 90° clockwise and saves a new PDF. There are no individual page or angle controls.'],
  } as const;
  for (const [slug, values] of Object.entries(expectedEnglish)) {
    const tool = DICTIONARIES.en.tools[slug];
    assert.deepEqual([tool.title, tool.h1, tool.description], values, slug + ' metadata/H1 description unchanged');
    assert.equal(tool.faqs?.length, 5, slug + ' Phase 1 FAQ content retained');
    const alternates = generateHreflangAlternates(slug).languages;
    assert.deepEqual(Object.keys(alternates).sort(), [...SUPPORTED_LOCALES, 'x-default'].sort(), slug + ' locale alternates still exist');
  }
  assert.equal(Object.keys(TOOLS_REGISTRY).length, 86);
  assert.equal(getAllPseoPaths().length, 1406);
  assert.equal(new Set(getAllPseoPaths()).size, 1406);
});

test('localized tool metadata remains intact while merge explanations clarify browser file order', () => {
  const slugs = Object.keys(expected);
  const snapshot = Object.fromEntries(['fr', 'es', 'de', 'ar'].map(locale => [
    locale,
    Object.fromEntries(slugs.map(slug => {
      const tool = DICTIONARIES[locale as 'fr' | 'es' | 'de' | 'ar'].tools[slug];
      return [slug, slug === 'merge-pdf' ? { title: tool.title, h1: tool.h1 } : tool];
    })),
  ]));
  assert.equal(
    createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),
    'd0967e169bc22fbb67837db95a6a45fe0812caaad5cc930c4ad1611fe37537d0',
    'French, Spanish, German and Arabic metadata remains unchanged outside the corrected shared Merge PDF explanation',
  );
  for (const locale of ['fr', 'es', 'de', 'ar'] as const) {
    const merge = DICTIONARIES[locale].tools['merge-pdf'];
    assert.match(merge.description, /not guaranteed|n’est pas garanti|no se garantiza|nicht garantiert|لا يُضمن/i);
    assert.match(merge.description, /cannot reorder|ne pouvez pas réorganiser|no puedes reordenar|nicht umsortieren|لا يمكنك إعادة ترتيب/i);
  }
});

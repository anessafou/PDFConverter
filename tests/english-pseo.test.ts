import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TOOLS_REGISTRY, getAllValidPseoSlugs } from '../src/config/tools-registry';
import { ENGLISH_INTENT_INDEX, getEnglishIntentSlugs, getEnglishGuidesForTool } from '../src/config/english-pseo-index';
import { getEnglishIntentPage } from '../src/config/english-pseo-content';
import { getAllPseoPaths } from '../src/config/i18n-pseo';
import { localizePath } from '../src/locales/routing';
import { getPlatformContent } from '../src/config/english-platform-content';
import { englishToolCapability } from '../src/config/english-tool-capabilities';
import { getToolContent } from '../src/config/tool-content';

test('English intents extend legacy URLs without adding translated clones', () => {
  const legacy = getAllValidPseoSlugs(), added = getEnglishIntentSlugs();
  assert.equal(legacy.length, 71);
  assert.equal(added.length, 7);
  assert.equal(new Set([...legacy, ...added]).size, 78);
  const paths = getAllPseoPaths();
  assert.equal(paths.length, 1406);
  assert.equal(paths.filter(path => !path.startsWith('/p/')).length, 1328);
  for (const slug of [...legacy, ...added]) assert(paths.includes('/p/' + slug));
  for (const slug of added) assert(!paths.some(path => path !== '/p/' + slug && path.endsWith('/p/' + slug)));
});

test('each new intent has unique metadata, task content and real tool links', () => {
  const titles = new Set(), descriptions = new Set(), headings = new Set(), bodies = new Set();
  for (const index of ENGLISH_INTENT_INDEX) {
    const page = getEnglishIntentPage(index.slug)!;
    assert(Object.hasOwn(TOOLS_REGISTRY, page.toolSlug));
    titles.add(page.title); descriptions.add(page.description); headings.add(page.h1);
    bodies.add(JSON.stringify([page.steps, page.sections, page.faqs]));
    assert(page.steps.length >= 3 && page.sections.length >= 2 && page.faqs.length >= 4);
    for (const slug of page.relatedTools) assert(Object.hasOwn(TOOLS_REGISTRY, slug));
    assert(getEnglishGuidesForTool(page.toolSlug).some(guide => guide.slug === page.slug));
    assert(!/100MB|unlimited|100% lossless|zero quality loss/i.test(JSON.stringify(page)));
  }
  for (const values of [titles, descriptions, headings, bodies]) assert.equal(values.size, ENGLISH_INTENT_INDEX.length);
  assert.equal(getEnglishIntentPage('unknown-guide'), null);
});

test('language navigation uses existing parents rather than invented translations', () => {
  for (const page of ENGLISH_INTENT_INDEX) {
    const english = '/p/' + page.slug + '?source=guide#file';
    assert.equal(localizePath(english, 'en'), english);
    for (const locale of ['fr', 'es', 'de', 'ar'] as const) {
      assert.equal(localizePath(english, locale), localizePath('/' + page.toolSlug, locale) + '?source=guide#file');
    }
  }
});

test('English legacy descriptions respect actual processing and file limits', () => {
  assert.equal(englishToolCapability(TOOLS_REGISTRY['word-to-pdf']).mode, 'service');
  assert.equal(englishToolCapability(TOOLS_REGISTRY['pdf-to-png']).mode, 'browser');
  assert.equal(englishToolCapability(TOOLS_REGISTRY['heic-to-jpg']).mode, 'browser-dependent');
  for (const slug of ['word-to-pdf', 'pdf-to-jpg', 'split-pdf', 'rotate-pdf']) {
    for (const modifier of ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'] as const) {
      const content = JSON.stringify(getPlatformContent(TOOLS_REGISTRY[slug], modifier));
      assert(!/100MB|unlimited|never uploaded|completely secure|zero performance bottlenecks/i.test(content));
      assert(content.includes('25 MB'));
    }
  }
  assert(englishToolCapability(TOOLS_REGISTRY['split-pdf']).result.includes('ZIP'));
  assert(englishToolCapability(TOOLS_REGISTRY['rotate-pdf']).summary.includes('every page 90 degrees clockwise'));
});

test('US platform overrides answer the selected device-specific queries', () => {
  const cases = [
    ['pdf-to-jpg', 'on-iphone', 'PDF to JPG on iPhone', 'multi-page file downloads as a ZIP'],
    ['pdf-to-jpg', 'for-windows', 'Convert PDF to JPG on Windows', 'no page-range control'],
    ['jpg-to-pdf', 'on-iphone', 'JPG to PDF on iPhone', 'does not combine a batch of photos'],
    ['merge-pdf', 'for-windows', 'Merge PDF files on Windows and check the browser file order', 'not guaranteed to match your selection sequence'],
    ['rotate-pdf', 'on-iphone', 'Rotate a PDF on iPhone: 90° clockwise for every page', 'every page 90° clockwise'],
    ['split-pdf', 'for-windows', 'Split PDF on Windows into one file per page', 'does not extract a custom page range'],
  ] as const;
  const bodies = new Set<string>();
  for (const [toolSlug, modifier, expectedTitle, expectedFact] of cases) {
    const content = getPlatformContent(TOOLS_REGISTRY[toolSlug], modifier);
    const body = JSON.stringify([content.guideTitle, content.guideText, content.steps, content.faqs]);
    assert(body.includes(expectedTitle), `${toolSlug}/${modifier} title should match the device task`);
    assert(body.includes(expectedFact), `${toolSlug}/${modifier} should state a verified limitation/output`);
    bodies.add(body);
  }
  assert.equal(bodies.size, cases.length, 'selected platform pages should not share the same guide body');
});

test('Phase 2 merge pages answer their distinct iPhone and watermark intents accurately', () => {
  const iphone = getPlatformContent(TOOLS_REGISTRY['merge-pdf'], 'on-iphone');
  assert.equal(iphone.guideTitle, 'Merge PDF files on iPhone from the browser file picker');
  assert(iphone.guideText.includes('2–20 PDFs'));
  assert(iphone.guideText.includes('browser-provided file list'));
  assert(iphone.guideText.includes('cannot reorder files after selection'));
  assert(iphone.guideText.includes('may differ from tap order'));
  assert(iphone.faqs.some(faq => faq.q === 'Where is the merged PDF saved?'));

  const watermark = getPlatformContent(TOOLS_REGISTRY['merge-pdf'], 'without-watermark');
  assert.equal(watermark.h1, 'Merge PDFs without adding a watermark');
  assert.equal(watermark.metaTitle, 'Merge PDFs Without Adding a Watermark | PDFConverter');
  assert(watermark.metaDescription?.includes('inspect the result for annotation-based marks'));
  assert(watermark.guideText.includes('does not add a new watermark'));
  assert(watermark.guideText.includes('marks can also be stored as annotations'));
  assert(watermark.faqs.some(faq => faq.q === 'Does merging these PDFs add a watermark?' && faq.a.startsWith('No.')));
  assert(watermark.faqs.some(faq => faq.q === 'Will it remove watermarks already in my PDFs?' && faq.a.includes('no watermark-removal control')));
  assert(watermark.steps.some(step => step.desc.includes('may differ from selection order')));

  const bodies = [iphone, watermark].map(page => JSON.stringify([page.guideTitle, page.guideText, page.steps, page.faqs]));
  assert.notEqual(bodies[0], bodies[1]);
  const windows = getPlatformContent(TOOLS_REGISTRY['merge-pdf'], 'for-windows');
  const words = [iphone, windows, watermark].map(page => new Set(
    (JSON.stringify([page.guideTitle, page.guideText, page.steps, page.faqs]).toLowerCase().match(/[a-z0-9]+/g) ?? []),
  ));
  const similarity = (left: Set<string>, right: Set<string>) => {
    const intersection = [...left].filter(word => right.has(word)).length;
    return intersection / new Set([...left, ...right]).size;
  };
  assert(similarity(words[0], words[1]) < 0.7, 'iPhone and Windows merge guides should retain distinct page-level value');
  assert(similarity(words[0], words[2]) < 0.7, 'iPhone and watermark merge guides should not become near-duplicates');
  assert(similarity(words[1], words[2]) < 0.7, 'Windows and watermark merge guides should not become near-duplicates');
});

test('core-tool FAQ additions are English-only and match implemented behavior', () => {
  const expected = [
    ['pdf-to-jpg', 'What happens when a PDF has multiple pages?', 'one JPG per page'],
    ['pdf-to-png', 'How are pages from a multi-page PDF downloaded?', 'one PNG per page'],
    ['merge-pdf', 'How many PDFs can I merge?', 'no more than 20'],
    ['rotate-pdf', 'What does the Rotate PDF button do?', '90° clockwise'],
    ['split-pdf', 'What does Split PDF download?', 'one PDF for every page'],
  ] as const;
  for (const [toolSlug, question, answer] of expected) {
    const englishFaqs = getToolContent(TOOLS_REGISTRY[toolSlug], 'en').faqs;
    assert(englishFaqs.some(faq => faq.q === question && faq.a.includes(answer)), `${toolSlug} should have its targeted English FAQ`);
    const frenchFaqs = getToolContent(TOOLS_REGISTRY[toolSlug], 'fr').faqs;
    assert(!frenchFaqs.some(faq => faq.q === question), `${toolSlug} French FAQs should remain unchanged`);
  }
});

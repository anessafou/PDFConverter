import assert from 'node:assert/strict';
import { test } from 'node:test';
import baseline from '../src/config/pseo-publication-baseline.json';
import reviews from '../src/config/pseo-publication-reviews.json';
import { ENGLISH_INTENT_INDEX } from '../src/config/english-pseo-index';
import { getEnglishIntentPage } from '../src/config/english-pseo-content';
import { getAllPseoPaths } from '../src/config/i18n-pseo';
import { localizePath } from '../src/locales/routing';
import { evaluatePseoCandidate, getPublishedPseoPages, getPublishedPseoPage, getPublishedPseoCounterpart, getPseoLanguageAlternates, getPublishedPlatformModifiers, resolvePublishedPseo, getPseoToolCapability } from '../src/config/pseo-publication';
import { validatePseoPublicationEvidence, validateReviewedPseoContent } from '../src/config/pseo-publication-validation';

test('publication preserves the entire frozen URL inventory in sitemap order', () => {
  assert.equal(baseline.paths.length, 1406);
  assert.deepEqual(getAllPseoPaths(), baseline.paths);
  assert.equal(new Set(getAllPseoPaths()).size, 1406);
  assert.deepEqual(['en', 'fr', 'es', 'de', 'ar'].map(locale => getPublishedPseoPages().filter(p => p.locale === locale).length), [78, 332, 332, 332, 332]);
  for (const path of baseline.paths) {
    const page = getPublishedPseoPage(path)!;
    assert(page.published && page.existing);
    assert.equal(resolvePublishedPseo(page.locale, path.split('/').at(-1)!)?.path, path);
  }
});

test('reviewed English task intents are eligible independently of the four legacy modifiers', () => {
  for (const index of ENGLISH_INTENT_INDEX) {
    const page = getPublishedPseoPage('/p/' + index.slug)!;
    assert.equal(page.intent.kind, 'task');
    assert(page.eligibleForNewPublication);
    assert.deepEqual(page.reviewReasons, []);
    assert.deepEqual(getPseoLanguageAlternates(page.path), { en: 'https://www.pdfconverter.space' + page.path });
  }
  assert.equal(getPublishedPseoPages().filter(p => p.eligibleForNewPublication).length, 7);
});

test('existing doubtful URLs are retained with explicit reasons rather than removed', () => {
  const worker = getPublishedPseoPage('/de/p/pdf-to-latex-fuer-mac')!;
  assert(worker.published && worker.existing && !worker.eligibleForNewPublication);
  assert(worker.reviewReasons.includes('external-service-not-verified'));
  assert(worker.reviewReasons.includes('outside-english-legacy-allowlist'));
  assert(worker.reviewReasons.includes('locale-content-not-reviewed'));
  assert(worker.reviewReasons.includes('explicit-publication-approval-missing'));
  assert.equal(getPseoToolCapability('heic-to-jpg'), 'browser-dependent');
  assert.equal(getPseoToolCapability('rotate-pdf'), 'browser-implemented');
});

test('unsupported tasks, missing locales/content, new modifiers and identity substitutions cannot publish', () => {
  const original = getPublishedPseoPage('/p/image-converter-images-to-ico')!;
  for (const candidate of [
    { ...original, path: '/p/image-converter-images-to-tiff', intent: { kind: 'task' as const, key: 'images-to-tiff' } },
    { ...original, path: '/fr/p/image-converter-images-to-ico', locale: 'fr' as const },
    { ...original, path: '/p/image-converter-new-unsupported-task', intent: { kind: 'task' as const, key: 'new-unsupported-task' } },
    { ...original, toolSlug: '__proto__' },
    { path: '/p/pdf-to-txt-without-watermark', locale: 'en' as const, toolSlug: 'pdf-to-txt', intent: { kind: 'platform' as const, modifier: 'without-watermark' as const } },
  ]) {
    const decision = evaluatePseoCandidate(candidate);
    assert(!decision.published && !decision.eligibleForNewPublication, candidate.path);
    assert(decision.reviewReasons.length > 0);
  }
  assert.equal(getPublishedPseoPage('/p/image-converter-images-to-tiff'), null);
  assert.equal(resolvePublishedPseo('fr', 'pdf-to-word-for-mac'), null);
});

test('hreflang only relates published equivalent intents and is fully reciprocal', () => {
  for (const page of getPublishedPseoPages()) {
    const languages = getPseoLanguageAlternates(page.path);
    assert.equal(languages[page.locale], 'https://www.pdfconverter.space' + page.path);
    for (const [locale, url] of Object.entries(languages)) {
      const other = getPublishedPseoPage(url.replace('https://www.pdfconverter.space', ''))!;
      assert(other && other.locale === locale && other.toolSlug === page.toolSlug);
      assert.deepEqual(other.intent, page.intent);
      assert.equal(getPseoLanguageAlternates(other.path)[page.locale], 'https://www.pdfconverter.space' + page.path);
    }
  }
  assert.equal(getPseoLanguageAlternates('/de/p/pdf-to-latex-fuer-mac').en, undefined);
});

test('navigation fallbacks and parent links use published inventory without inventing translations', () => {
  for (const page of getPublishedPseoPages()) {
    for (const locale of ['en', 'fr', 'es', 'de', 'ar'] as const) {
      const target = getPublishedPseoCounterpart(page.path, locale);
      const localized = localizePath(page.path + '?test=1#file', locale);
      if (target) assert.equal(localized, target.path + '?test=1#file');
      else assert(!localized.includes('/p/'));
    }
  }
  for (const modifier of getPublishedPlatformModifiers('pdf-to-word')) assert(getPublishedPseoPage('/p/pdf-to-word-' + modifier));
  assert.equal(localizePath('/p/image-converter-unapproved-task', 'de'), '/p/image-converter-unapproved-task');
});

test('approved content and implementation evidence are present and unchanged; content mutations fail', () => {
  validatePseoPublicationEvidence();
  for (const review of reviews) {
    const page = getEnglishIntentPage(review.path.split('/').at(-1)!)!;
    assert(validateReviewedPseoContent(page, review.contentSha256));
    assert(!validateReviewedPseoContent({ ...page, title: 'Unreviewed title' }, review.contentSha256));
    assert(!validateReviewedPseoContent({ ...page, faqs: [] }, review.contentSha256));
  }
  assert(!validateReviewedPseoContent(null, 'missing'));
});

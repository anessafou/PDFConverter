import assert from 'node:assert/strict';
import { test } from 'node:test';
import baseline from '../src/config/pseo-publication-baseline.json';
import { getAllPseoPaths } from '../src/config/i18n-pseo';
import { getLocalizedPseoEditorial, LOCALIZED_PSEO_EDITORIAL_PATHS } from '../src/config/localized-pseo-editorial';

test('editorial guidance is limited to the four approved existing German and French routes', () => {
  assert.deepEqual([...LOCALIZED_PSEO_EDITORIAL_PATHS].sort(), [
    '/de/p/merge-pdf-auf-dem-iphone',
    '/de/p/merge-pdf-fuer-windows',
    '/de/p/pdf-to-jpg-fuer-windows',
    '/fr/p/merge-pdf-sur-iphone',
  ]);
  for (const path of LOCALIZED_PSEO_EDITORIAL_PATHS) assert(baseline.paths.includes(path), `${path} is in the retention baseline`);
  assert.equal(getAllPseoPaths().length, 1406);
  assert.deepEqual([...getAllPseoPaths()].sort(), [...baseline.paths].sort());
  assert.equal(getLocalizedPseoEditorial('es', 'merge-pdf', 'on-iphone'), undefined);
  assert.equal(getLocalizedPseoEditorial('de', 'merge-pdf', 'for-mac'), undefined);
});

test('each approved guide contains unique, practical steps and capability-backed limits', () => {
  const targets = [
    ['de', 'pdf-to-jpg', 'for-windows'],
    ['de', 'merge-pdf', 'for-windows'],
    ['de', 'merge-pdf', 'on-iphone'],
    ['fr', 'merge-pdf', 'on-iphone'],
  ] as const;
  const guides = targets.map(([locale, tool, modifier]) => getLocalizedPseoEditorial(locale, tool, modifier)!);
  assert(guides.every(Boolean));
  assert.equal(new Set(guides.map(guide => guide.intro)).size, 4);
  for (const guide of guides) {
    assert(guide.steps.length >= 3 && guide.steps.length <= 5);
    assert(guide.output.length > 60);
    assert(guide.limitations.length > 80);
    assert(guide.steps.every(step => step.title && step.description));
  }
  for (const guide of guides.slice(1)) {
    assert.match(guide.limitations, /25/);
    assert.match(guide.limitations, /20/);
    assert.match(guide.limitations, /ordre|Reihenfolge|sortier/i);
  }
  const mergeGuides = guides.slice(1);
  for (const guide of mergeGuides) {
    const orderText = [guide.intro, ...guide.steps.map(step => step.description), guide.output, guide.limitations].join(' ');
    assert.match(orderText, /Browser-Dateiliste|liste.*navigateur/i);
    assert.match(orderText, /nicht garantiert|n’est pas garanti/i);
    assert.match(orderText, /manuell|manuellement/i);
    assert(Object.values(guide.faqAnswerOverrides ?? {}).some(answer => /Dateiliste|liste de fichiers/i.test(answer)));
    assert(Object.values(guide.faqAnswerOverrides ?? {}).some(answer => /nicht garantiert|muss nicht|n’est pas garanti/i.test(answer)));
  }
  assert.match(guides[0].output, /40 Megapixel/);
  assert.match(guides[0].output, /ZIP/);
  for (const guide of guides) {
    if (guide.relatedLink) assert(baseline.paths.includes(guide.relatedLink.href), `related link ${guide.relatedLink.href} is published`);
  }
});

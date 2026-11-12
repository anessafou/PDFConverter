import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DICTIONARIES } from '../src/locales/dictionaries';
import { translate } from '../src/locales/translate';
import { localizePath, localeFromPath } from '../src/locales/routing';
import { TOOLS_REGISTRY, getAllValidPseoSlugs } from '../src/config/tools-registry';
import { SUPPORTED_LOCALES } from '../src/config/i18n-registry';
import uiCatalog from '../src/locales/ui-catalog.json';

test('every registered service has complete localized content and FAQs', () => {
  for (const tool of Object.values(TOOLS_REGISTRY)) for (const locale of SUPPORTED_LOCALES) {
    const copy = DICTIONARIES[locale].tools[tool.slug];
    assert.ok(copy?.title && copy.h1 && copy.description && copy.faqs?.length);
    if (locale !== 'en') {
      assert.notEqual(copy.h1, tool.name, locale + '/' + tool.slug);
      assert.notEqual(copy.description, tool.description, locale + '/' + tool.slug);
    }
  }
});
test('shared UI catalogs contain all four translations', () => {
  const keys = new Set<string>();
  for (const row of uiCatalog) {
    assert.equal(row.length, 5, row[0]);
    assert.ok(row.every(text => text.trim().length > 0), row[0]);
    assert.ok(!keys.has(row[0]), 'Duplicate translation key: ' + row[0]);
    keys.add(row[0]);
  }
});
test('tool routes survive every language switch and preserve suffixes', () => {
  for (const tool of Object.values(TOOLS_REGISTRY)) for (const locale of SUPPORTED_LOCALES) {
    const original = '/' + tool.slug + '?source=menu#upload';
    const localized = localizePath(original, locale);
    assert.equal(localeFromPath(localized), locale);
    assert.equal(localizePath(localized, 'en'), original);
    assert.equal(localizePath(localized, locale), localized);
  }
});
test('existing pSEO routes retain their modifiers and round-trip through all locales', () => {
  for (const slug of getAllValidPseoSlugs()) for (const locale of SUPPORTED_LOCALES) {
    const original = '/p/' + slug + '?test=1#file';
    assert.equal(localizePath(localizePath(original, locale), 'en'), original);
  }
  assert.equal(localizePath('/fr/p/pdf-to-latex-sur-mac', 'en'), '/pdf-to-latex');
});
test('translation preserves English and interpolates localized controls correctly', () => {
  assert.equal(translate('en', 'Convert to TXT Now'), 'Convert to TXT Now');
  assert.equal(translate('fr', 'Convert to TXT Now'), 'Convertir en TXT maintenant');
  assert.equal(translate('es', 'Convert to TXT Now'), 'Convertir a TXT ahora');
  assert.equal(translate('de', 'Convert to TXT Now'), 'Jetzt in TXT konvertieren');
  assert.equal(translate('ar', 'Convert to TXT Now'), 'حوّل إلى TXT الآن');
  assert.equal(translate('fr', 'Convert PDF to PNG format'), 'Convertir PDF en PNG');
});
test('infrastructure, downloads, external links and anchor links are not localized', () => {
  for (const href of ['/api/reviews', '/_next/static/chunk.js', '/favicon.svg', '/secretadmin2026here/login', 'https://example.com', '#all-tools', 'blob:example', '//example.com']) {
    assert.equal(localizePath(href, 'ar'), href);
  }
  assert.equal(localizePath('/category/image', 'de'), '/de/category/image');
  assert.equal(localizePath('/de/category/image', 'fr'), '/fr/category/image');
});

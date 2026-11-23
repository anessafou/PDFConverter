import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function run(...args) {
  return spawnSync(process.execPath, ['scripts/submit-indexnow.mjs', ...args], {
    encoding: 'utf8',
    timeout: 10_000,
  });
}

test('dry-run accepts one first-party URL without submitting', () => {
  const result = run('https://www.pdfconverter.space/compress-pdf');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dry-run only/);
});

test('dry-run deduplicates URLs', () => {
  const url = 'https://www.pdfconverter.space/compress-pdf';
  const result = run(url, url);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /URLs selected: 1/);
});

for (const url of [
  'http://www.pdfconverter.space/compress-pdf',
  'https://pdfconverter.space/compress-pdf',
  'https://www.pdfconverter.space.evil.test/compress-pdf',
  'https://www.pdfconverter.space/api/secret',
  'https://www.pdfconverter.space/sitemap.xml',
  'https://www.pdfconverter.space/compress-pdf?test=1',
]) {
  test('rejects ineligible URL: ' + url, () => {
    const result = run(url);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Not an eligible page URL/);
  });
}

test('requires at least one URL', () => {
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Supply 1/);
});

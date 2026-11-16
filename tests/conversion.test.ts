import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { runConversion } from '../src/core/converter-engine';
import { TOOLS_REGISTRY } from '../src/config/tools-registry';
import { hasExpectedSignature, readLimitedBody } from '../src/core/conversion-response';

async function samplePdf(pages = 1) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) pdf.addPage([200 + i * 10, 300]);
  return new File([new Uint8Array(await pdf.save())], 'input.pdf', { type: 'application/pdf' });
}
async function bytes(blob: Blob) { return new Uint8Array(await blob.arrayBuffer()); }

test('Base64 round trips binary PDF data', async () => {
  const file = await samplePdf();
  const result = await runConversion(file, TOOLS_REGISTRY['pdf-to-base64']);
  try { assert.deepEqual(Buffer.from(await result.blob.text(), 'base64'), Buffer.from(await file.arrayBuffer())); }
  finally { URL.revokeObjectURL(result.downloadUrl); }
});

test('PDF merge, rotate, and split emit valid transformed PDFs', async () => {
  const first = await samplePdf(2), second = await samplePdf(1);
  const merged = await runConversion(first, TOOLS_REGISTRY['merge-pdf'], { files: [second] });
  const rotated = await runConversion(first, TOOLS_REGISTRY['rotate-pdf']);
  const split = await runConversion(first, TOOLS_REGISTRY['split-pdf']);
  try {
    assert.equal((await PDFDocument.load(await bytes(merged.blob))).getPageCount(), 3);
    assert.equal((await PDFDocument.load(await bytes(rotated.blob))).getPage(0).getRotation().angle, 90);
    assert.ok(split.fileName.endsWith('.zip'));
    const zip = await JSZip.loadAsync(await split.blob.arrayBuffer());
    const files = Object.values(zip.files).filter(f => !f.dir);
    assert.equal(files.length, 2);
    for (const f of files) assert.equal((await PDFDocument.load(await f.async('uint8array'))).getPageCount(), 1);
  } finally { for (const item of [merged, rotated, split]) URL.revokeObjectURL(item.downloadUrl); }
});

test('failed backend conversions reject and never return simulated files', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Worker unavailable' }), { status: 503 });
    await assert.rejects(runConversion(await samplePdf(), TOOLS_REGISTRY['pdf-to-word']), /Worker unavailable/);
    globalThis.fetch = async () => { throw new Error('network offline'); };
    await assert.rejects(runConversion(await samplePdf(), TOOLS_REGISTRY['pdf-to-word']), /network offline/);
  } finally { globalThis.fetch = original; }
});

test('input validation rejects mismatched and empty files', async () => {
  await assert.rejects(runConversion(new File(['text'], 'file.txt'), TOOLS_REGISTRY['pdf-to-word']), /Unsupported input/);
  await assert.rejects(runConversion(new File([], 'file.pdf'), TOOLS_REGISTRY['pdf-to-word']), /non-empty/);
  await assert.rejects(runConversion(await samplePdf(), TOOLS_REGISTRY['merge-pdf']), /at least two/);
});

test('worker responses are bounded and binary signatures distinguish renamed files', async () => {
  assert.equal(hasExpectedSignature(new TextEncoder().encode('%PDF-1.7'), 'docx'), false);
  assert.equal(hasExpectedSignature(new Uint8Array([80, 75, 3, 4]), 'docx'), true);
  assert.equal(hasExpectedSignature(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), 'bmp'), false);
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(20)); controller.close(); } });
  await assert.rejects(readLimitedBody(stream, 10), /exceeds/);
});

import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';

let worker: Server;
let workerBytes: Buffer = Buffer.from('not a converted file');
test.beforeAll(async () => {
  worker = createServer(async (req, res) => {
    for await (const _chunk of req) { /* consume upload */ }
    res.end(workerBytes);
  });
  await new Promise<void>(resolve => worker.listen(3015, '127.0.0.1', resolve));
});
test.afterAll(async () => { await new Promise<void>((resolve, reject) => worker.close(error => error ? reject(error) : resolve())); });
async function pdfFixture(pages = 1, text = 'Real extracted document text') {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) pdf.addPage([400, 300]).drawText(text, { x: 20, y: 200, size: 12, font });
  return Buffer.from(await pdf.save());
}
async function convert(page: Page, slug: string, name: string, buffer: Buffer) {
  await page.goto('/' + slug);
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/octet-stream', buffer });
  await page.getByRole('button', { name: /^Convert to .* Now$/ }).click();
  await expect(page.getByText('Conversion Successful!', { exact: true })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download File', exact: true }).click();
  const download = await pending;
  return { name: download.suggestedFilename(), bytes: await readFile((await download.path())!) };
}

test('PDF text and JSON use document extraction', async ({ page }) => {
  const input = await pdfFixture();
  const text = await convert(page, 'pdf-to-txt', 'source.pdf', input);
  expect(text.bytes.toString()).toContain('Real extracted document text');
  expect(text.bytes.toString()).not.toContain('%PDF');
  const json = await convert(page, 'pdf-to-json', 'source.pdf', input);
  expect(JSON.parse(json.bytes.toString()).pages[0].text).toContain('Real extracted document text');
});

test('PDF page images are rendered, and BMP has a real BMP header', async ({ page }) => {
  const images = await convert(page, 'pdf-to-png', 'source.pdf', await pdfFixture(2));
  expect(images.name).toMatch(/\.zip$/);
  const zip = await JSZip.loadAsync(images.bytes);
  const entries = Object.values(zip.files).filter(f => !f.dir);
  expect(entries).toHaveLength(2);
  expect(Array.from((await entries[0].async('uint8array')).slice(0, 4))).toEqual([137, 80, 78, 71]);
  const bmp = await convert(page, 'pdf-to-bmp', 'source.pdf', await pdfFixture());
  expect(bmp.bytes.subarray(0, 2).toString()).toBe('BM');
});

test('DOCX extracts text and XLSX emits cell values as CSV', async ({ page }) => {
  const docx = new JSZip();
  docx.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  docx.file('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  docx.file('word/document.xml', '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Actual Word document text</w:t></w:r></w:p></w:body></w:document>');
  const word = await convert(page, 'docx-to-txt', 'source.docx', await docx.generateAsync({ type: 'nodebuffer' }));
  expect(word.bytes.toString()).toContain('Actual Word document text');
  const book = new ExcelJS.Workbook();
  book.addWorksheet('Sheet1').addRows([['Name', 'Value'], ['Example', 42]]);
  const csv = await convert(page, 'xlsx-to-csv', 'source.xlsx', Buffer.from(await book.xlsx.writeBuffer()));
  expect(csv.bytes.toString()).toContain('Example,42');
  expect(csv.bytes.toString()).not.toContain('PK');
});

test('queue changes preserve previews and existing converted downloads', async ({ page }) => {
  await page.goto('/image-converter');
  const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 8; return c.toDataURL('image/png').split(',')[1]; });
  const file = { name: 'first.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') };
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByRole('button', { name: 'JPG', exact: true }).click();
  await page.getByRole('button', { name: 'Convert All to JPG', exact: true }).click();
  await expect(page.getByText('✓ Converted', { exact: true })).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({ ...file, name: 'second.png' });
  await page.getByRole('button', { name: 'PNG', exact: true }).click();
  const images = page.locator('img[src^="blob:"]');
  expect(await images.count()).toBe(2);
  expect(await images.evaluateAll(async elements => Promise.all(elements.map(async img => (await fetch((img as HTMLImageElement).src)).ok)))) .toEqual([true, true]);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  const download = await pending;
  const output = await readFile((await download.path())!);
  expect(Array.from(output.subarray(0, 3))).toEqual([255, 216, 255]);
});

test('worker proxy rejects renamed bytes and accepts converted DOCX output', async ({ request }) => {
  const upload = await pdfFixture();
  const send = () => request.post('/api/convert', { multipart: { toolSlug: 'pdf-to-word', file: { name: 'source.pdf', mimeType: 'application/pdf', buffer: upload } } });
  workerBytes = upload;
  expect((await send()).status()).toBe(502);
  const zip = new JSZip(); zip.file('word/document.xml', '<document/>');
  workerBytes = await zip.generateAsync({ type: 'nodebuffer' });
  const response = await send();
  expect(response.status()).toBe(200);
  expect((await response.body()).equals(workerBytes)).toBe(true);
});

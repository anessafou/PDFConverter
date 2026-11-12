import type { ToolDefinition } from '@/config/tools-registry';
import { encodeCanvas, loadImageCanvas } from './image-encoding';

export interface ConversionResult { fileName: string; blob: Blob; downloadUrl: string; }
const MAX_FILE_BYTES = 25 * 1024 * 1024;

function result(blob: Blob, fileName: string): ConversionResult {
  if (!blob.size) throw new Error('The conversion produced an empty file.');
  return { blob, fileName, downloadUrl: URL.createObjectURL(blob) };
}
function textResult(text: string, name: string, mime = 'text/plain'): ConversionResult {
  return result(new Blob([text], { type: mime + ';charset=utf-8' }), name);
}
function validateFile(file: File, tool: ToolDefinition) {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!tool.inputFormat.includes(extension)) throw new Error('Unsupported input. Choose ' + tool.inputFormat.join(', ') + '.');
  if (!file.size || file.size > MAX_FILE_BYTES) throw new Error('Choose a non-empty file of 25 MB or smaller.');
}

export function triggerFileDownload(converted: ConversionResult): void {
  const link = document.createElement('a');
  link.href = converted.downloadUrl; link.download = converted.fileName;
  document.body.appendChild(link); link.click(); link.remove();
  // The component owns this URL and releases it when the result is replaced or unmounted.
}

export async function runConversion(file: File, tool: ToolDefinition, options?: Record<string, unknown>): Promise<ConversionResult> {
  validateFile(file, tool);
  const base = file.name.replace(/\.[^.]+$/, '') || 'converted';
  const extension = tool.outputFormat;
  const name = base + '-converted.' + extension;

  // Dispatch by operation and input format; an output extension does not identify a parser.
  if (tool.slug === 'pdf-to-base64') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunks: string[] = [];
    for (let i = 0; i < bytes.length; i += 8192) chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
    return textResult(btoa(chunks.join('')), base + '-base64.txt');
  }
  if (tool.category === 'image' && tool.slug !== 'gif-to-webp' && ['png', 'jpg', 'webp', 'avif', 'bmp'].includes(extension)) {
    const canvas = await loadImageCanvas(file);
    if (['jpg', 'bmp'].includes(extension)) {
      const ctx = canvas.getContext('2d')!;
      ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return result(await encodeCanvas(canvas, extension), name);
  }
  if (['pdf-to-txt', 'pdf-to-markdown', 'pdf-to-json', 'pdf-to-xml', 'pdf-to-html'].includes(tool.slug)) {
    const { openPdf } = await import('./pdf-browser');
    const pdf = await openPdf(file);
    try {
      const pages: { page: number; text: string }[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const text = content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
        pages.push({ page: n, text });
        page.cleanup();
      }
      if (!pages.some(page => page.text)) throw new Error('This PDF contains no extractable text. OCR requires the conversion service.');
      const text = pages.map(page => page.text).join('\n\n');
      const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      if (extension === 'json') return textResult(JSON.stringify({ pages }, null, 2), name, 'application/json');
      if (extension === 'xml') return textResult('<?xml version="1.0" encoding="UTF-8"?><document>' + pages.map(p => '<page number="' + p.page + '">' + escape(p.text) + '</page>').join('') + '</document>', name, 'application/xml');
      if (extension === 'html') return textResult('<!doctype html><html><head><meta charset="utf-8"><title>Extracted PDF text</title></head><body><pre>' + escape(text) + '</pre></body></html>', name, 'text/html');
      return textResult(text, name, extension === 'md' ? 'text/markdown' : 'text/plain');
    } finally { await pdf.destroy(); }
  }
  if (['pdf-to-png', 'pdf-to-jpg', 'pdf-to-webp', 'pdf-to-bmp', 'pdf-to-long-image'].includes(tool.slug)) {
    return renderPdfImages(file, tool, base);
  }
  if (tool.slug === 'docx-to-txt' || tool.slug === 'docx-to-html') {
    const mammoth = await import('mammoth');
    const input = { arrayBuffer: await file.arrayBuffer() };
    const converted = tool.slug === 'docx-to-txt' ? await mammoth.extractRawText(input) : await mammoth.convertToHtml(input);
    if (extension === 'html') return textResult('<!doctype html><html><head><meta charset="utf-8"><title>Converted document</title></head><body>' + converted.value + '</body></html>', name, 'text/html');
    return textResult(converted.value, name);
  }
  if (tool.slug === 'xlsx-to-csv') {
    const { Workbook } = await import('exceljs');
    const book = new Workbook();
    await book.xlsx.load(await file.arrayBuffer());
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const files: { name: string; text: string }[] = [];
    for (const sheet of book.worksheets) {
      const csv = await book.csv.writeBuffer({ sheetId: sheet.id });
      files.push({ name: sheet.name.replace(/[<>:"/\\|?*]/g, '_') + '.csv', text: csv.toString() });
    }
    if (!files.length) throw new Error('This workbook contains no worksheets.');
    if (files.length === 1) return textResult(files[0].text, name, 'text/csv');
    files.forEach((f, i) => zip.file((i + 1) + '-' + f.name, f.text));
    return result(await zip.generateAsync({ type: 'blob' }), base + '-worksheets.zip');
  }
  if (['jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'svg-to-pdf', 'bmp-to-pdf'].includes(tool.slug)) {
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.create();
    const canvas = await loadImageCanvas(file);
    const png = await encodeCanvas(canvas, 'png');
    const image = await pdf.embedPng(await png.arrayBuffer());
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    return result(new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' }), name);
  }
  if (tool.slug === 'merge-pdf' || tool.slug === 'rotate-pdf' || tool.slug === 'split-pdf') {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    if (tool.slug === 'rotate-pdf') {
      const angle = typeof options?.rotation === 'number' ? options.rotation : 90;
      if (![90, 180, 270].includes(angle)) throw new Error('Choose a rotation of 90, 180, or 270 degrees.');
      pdf.getPages().forEach(page => page.setRotation(degrees((page.getRotation().angle + angle) % 360)));
      return result(new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' }), name);
    }
    if (tool.slug === 'merge-pdf') {
      const additional = Array.isArray(options?.files) ? options.files as File[] : [];
      if (!additional.length) throw new Error('Choose at least two PDF files to merge.');
      if (additional.length > 19) throw new Error('Merge up to 20 PDF files at a time.');
      const merged = await PDFDocument.create();
      for (const input of [file, ...additional]) {
        validateFile(input, tool);
        const source = input === file ? pdf : await PDFDocument.load(await input.arrayBuffer());
        (await merged.copyPages(source, source.getPageIndices())).forEach(page => merged.addPage(page));
      }
      return result(new Blob([new Uint8Array(await merged.save())], { type: 'application/pdf' }), name);
    }
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const index of pdf.getPageIndices()) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(pdf, [index]); single.addPage(page);
      zip.file(base + '-page-' + (index + 1) + '.pdf', await single.save());
    }
    return result(await zip.generateAsync({ type: 'blob' }), base + '-pages.zip');
  }
  const data = new FormData();
  data.append('file', file); data.append('toolSlug', tool.slug);
  const response = await fetch('/api/convert', { method: 'POST', body: data });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || 'The conversion service could not process this file.');
  }
  return result(await response.blob(), name);
}

async function renderPdfImages(file: File, tool: ToolDefinition, base: string): Promise<ConversionResult> {
  const { openPdf } = await import('./pdf-browser');
  const pdf = await openPdf(file);
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const long = tool.slug === 'pdf-to-long-image';
    const ext = tool.outputFormat;
    const pages: HTMLCanvasElement[] = [];
    let pixels = 0;
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 1.5 });
      pixels += Math.ceil(viewport.width) * Math.ceil(viewport.height);
      if (pixels > 40_000_000) throw new Error('Rendered PDF exceeds the 40 megapixel limit. Convert a smaller document.');
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context unavailable.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      if (long) pages.push(canvas);
      else {
        const blob = await encodeCanvas(canvas, ext);
        if (pdf.numPages === 1) return result(blob, base + '-converted.' + ext);
        zip.file(base + '-page-' + n + '.' + ext, blob);
        canvas.width = canvas.height = 0;
      }
      page.cleanup();
    }
    if (long) {
      const combined = document.createElement('canvas');
      combined.width = Math.max(...pages.map(p => p.width)); combined.height = pages.reduce((sum, p) => sum + p.height, 0);
      if (combined.width * combined.height > 40_000_000 || combined.height > 30000) throw new Error('Combined image is too large. Choose PDF to PNG for separate pages.');
      const ctx = combined.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable.');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, combined.width, combined.height);
      let y = 0;
      for (const canvas of pages) { ctx.drawImage(canvas, 0, y); y += canvas.height; canvas.width = canvas.height = 0; }
      return result(await encodeCanvas(combined, 'png'), base + '-long.png');
    }
    return result(await zip.generateAsync({ type: 'blob' }), base + '-pages.zip');
  } finally { await pdf.destroy(); }
}

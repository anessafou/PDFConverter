import { NextRequest, NextResponse } from 'next/server';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { MAX_UPLOAD_BYTES, MAX_OUTPUT_BYTES, readLimitedBody, hasExpectedSignature } from '@/core/conversion-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const raw = await readLimitedBody(req.body, MAX_UPLOAD_BYTES + 1024 * 1024);
    const form = await new Request('http://localhost/convert', {
      method: 'POST', headers: { 'Content-Type': req.headers.get('content-type') || '' }, body: raw,
    }).formData();
    const file = form.get('file');
    const slug = form.get('toolSlug');
    const tool = typeof slug === 'string' && Object.hasOwn(TOOLS_REGISTRY, slug) ? TOOLS_REGISTRY[slug] : undefined;
    if (!(file instanceof File) || !tool || !file.size) {
      return NextResponse.json({ error: 'A non-empty file and valid converter are required.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Maximum upload size is 25 MB.' }, { status: 413 });
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!tool.inputFormat.includes(extension)) return NextResponse.json({ error: 'Unsupported input file format.' }, { status: 415 });
    const worker = process.env.CONVERSION_WORKER_URL;
    if (!worker) return NextResponse.json({ error: 'This conversion requires a conversion service, which is not configured yet.' }, { status: 503 });
    const url = new URL(worker.replace(/\/$/, '') + '/convert');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid conversion service configuration.');
    const forwarded = new FormData();
    forwarded.append('file', file); forwarded.append('toolSlug', tool.slug); forwarded.append('targetFormat', tool.outputFormat);
    const response = await fetch(url, {
      method: 'POST', body: forwarded, signal: AbortSignal.timeout(120000), redirect: 'error',
      headers: process.env.CONVERSION_WORKER_TOKEN ? { Authorization: 'Bearer ' + process.env.CONVERSION_WORKER_TOKEN } : {},
    });
    if (!response.ok) return NextResponse.json({ error: 'The conversion service could not convert this file.' }, { status: 502 });
    const output = await readLimitedBody(response.body, MAX_OUTPUT_BYTES);
    if (!hasExpectedSignature(output, tool.outputFormat)) {
      return NextResponse.json({ error: 'The conversion service returned an invalid output file.' }, { status: 502 });
    }
    const original = new Uint8Array(await file.arrayBuffer());
    if (extension.slice(1) !== tool.outputFormat && original.length === output.length && original.every((byte, index) => byte === output[index])) {
      return NextResponse.json({ error: 'The conversion service returned the original file without converting it.' }, { status: 502 });
    }
    const outputName = (file.name.replace(/\.[^.]+$/, '') || 'converted') + '-converted.' + tool.outputFormat;
    return new NextResponse(output, { headers: {
      'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="' + encodeURIComponent(outputName) + '"',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    console.error('Conversion error:', error);
    const sizeError = error instanceof Error && error.message.includes('exceeds the allowed size');
    return NextResponse.json({ error: sizeError ? 'File exceeds the allowed size.' : 'Conversion failed. Please try again or choose another format.' }, { status: sizeError ? 413 : 500 });
  }
}

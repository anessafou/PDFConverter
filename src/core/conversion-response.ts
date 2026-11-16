export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_OUTPUT_BYTES = 100 * 1024 * 1024;

export async function readLimitedBody(body: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!body) throw new Error('No file data received.');
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('File exceeds the allowed size.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function hasExpectedSignature(bytes: Uint8Array, extension: string): boolean {
  const starts = (...magic: number[]) => magic.every((byte, index) => bytes[index] === byte);
  const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (!bytes.length) return false;
  if (extension === 'pdf') return ascii(0, 5) === '%PDF-';
  if (['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'epub', 'zip'].includes(extension)) return starts(0x50, 0x4b, 3, 4);
  if (['jpg', 'jpeg'].includes(extension)) return starts(0xff, 0xd8, 0xff);
  if (extension === 'png') return starts(137, 80, 78, 71, 13, 10, 26, 10);
  if (extension === 'webp') return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
  if (extension === 'bmp') return ascii(0, 2) === 'BM';
  if (extension === 'gif') return ['GIF87a', 'GIF89a'].includes(ascii(0, 6));
  if (extension === 'tiff') return starts(0x49, 0x49, 42, 0) || starts(0x4d, 0x4d, 0, 42);
  if (extension === 'ico') return starts(0, 0, 1, 0);
  if (extension === 'avif') return ascii(4, 4) === 'ftyp' && /avif|avis/.test(ascii(8, 24));
  if (extension === 'rtf') return ascii(0, 5) === '{\\rtf';
  if (extension === 'ps') return ascii(0, 4) === '%!PS';
  // Text and specialist formats must still be validated by the configured conversion worker.
  return true;
}

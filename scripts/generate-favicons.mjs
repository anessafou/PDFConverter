// scripts/generate-favicons.mjs
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Generate valid RGBA PNG matching the PDFConverter branding
function createBrandedPng(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const radius = width * 0.22;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      // Corner distance check for rounded squircle
      let inside = true;
      const rx = x < radius ? radius - x : x > width - 1 - radius ? x - (width - 1 - radius) : 0;
      const ry = y < radius ? radius - y : y > height - 1 - radius ? y - (height - 1 - radius) : 0;

      if (rx > 0 && ry > 0) {
        inside = rx * rx + ry * ry <= radius * radius;
      }

      if (!inside) {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0; // Transparent
        continue;
      }

      // Linear gradient from #FF476E (top) to #FF2E54 (bottom)
      const t = y / height;
      let r = Math.round(255);
      let g = Math.round(71 + (46 - 71) * t);
      let b = Math.round(110 + (84 - 110) * t);
      let a = 255;

      // Draw white document icon in the center
      const docLeft = width * 0.28;
      const docRight = width * 0.72;
      const docTop = height * 0.22;
      const docBottom = height * 0.78;
      const foldSize = width * 0.16;

      const inDoc = x >= docLeft && x <= docRight && y >= docTop && y <= docBottom;
      const inFoldCut = x > docRight - foldSize && y < docTop + foldSize && (x - (docRight - foldSize)) + (docTop + foldSize - y) > foldSize;

      if (inDoc && !inFoldCut) {
        // Outline thickness
        const borderW = Math.max(1, Math.round(width * 0.05));
        const isBorder = x < docLeft + borderW || x > docRight - borderW || y < docTop + borderW || y > docBottom - borderW;

        // Folded flap line
        const isFlap = Math.abs((x - (docRight - foldSize)) - (docTop + foldSize - y)) <= borderW && x >= docRight - foldSize && y <= docTop + foldSize;

        // Document text lines
        const lineH = Math.max(1, Math.round(height * 0.04));
        const line1 = y >= height * 0.44 && y <= height * 0.44 + lineH && x >= width * 0.38 && x <= width * 0.62;
        const line2 = y >= height * 0.54 && y <= height * 0.54 + lineH && x >= width * 0.38 && x <= width * 0.62;
        const line3 = y >= height * 0.64 && y <= height * 0.64 + lineH && x >= width * 0.38 && x <= width * 0.52;

        if (isBorder || isFlap || line1 || line2 || line3) {
          r = 255;
          g = 255;
          b = 255;
          a = 255;
        } else {
          // Semi-translucent document interior
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 40);
          b = Math.min(255, b + 40);
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Build PNG container
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate multi-resolution Windows/browser favicon.ico containing 16x16, 32x32, and 48x48
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

console.log('Generating branded favicon assets for PDFConverter...');

const p16 = createBrandedPng(16);
const p32 = createBrandedPng(32);
const p48 = createBrandedPng(48);
const p180 = createBrandedPng(180);
const p192 = createBrandedPng(192);
const p512 = createBrandedPng(512);

fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), p16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), p32);
fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), p48);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
fs.writeFileSync(path.join(publicDir, 'web-app-manifest-192x192.png'), p192);
fs.writeFileSync(path.join(publicDir, 'web-app-manifest-512x512.png'), p512);

const icoBuf = createIco([
  { size: 16, buffer: p16 },
  { size: 32, buffer: p32 },
  { size: 48, buffer: p48 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

console.log('✓ Successfully generated all favicon formats in public/:');
console.log('  - public/favicon.ico (Multi-size: 16, 32, 48)');
console.log('  - public/favicon-16x16.png');
console.log('  - public/favicon-32x32.png');
console.log('  - public/favicon-48x48.png (Google Search 48px standard)');
console.log('  - public/apple-touch-icon.png (180x180)');
console.log('  - public/web-app-manifest-192x192.png');
console.log('  - public/web-app-manifest-512x512.png');
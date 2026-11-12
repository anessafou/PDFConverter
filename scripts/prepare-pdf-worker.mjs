import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
await mkdir(new URL('../public/vendor/', import.meta.url), { recursive: true });
await copyFile(require.resolve('pdfjs-dist/build/pdf.worker.min.mjs'), new URL('../public/vendor/pdf.worker.min.mjs', import.meta.url));

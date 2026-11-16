import type { ServiceCategory } from './tools-registry';

const CATEGORY_METADATA: Record<
  ServiceCategory,
  { name: string; title: string; description: string; heading: string }
> = {
  'pdf-to': {
    name: 'PDF to Other Formats',
    title: 'PDF to Word, Excel, JPG & Other Formats - PDFConverter',
    description: 'Convert PDF files into Microsoft Word, Excel spreadsheets, PowerPoint, JPG, and PNG images online for free.',
    heading: 'Convert From PDF',
  },
  'convert-to-pdf': {
    name: 'Convert to PDF',
    title: 'Convert Documents & Images to PDF Online Free - PDFConverter',
    description: 'Choose the PDF converter for your source format. Some formats require a conversion service.',
    heading: 'Convert Any Document to PDF',
  },
  'document': {
    name: 'PDF Organization & Office',
    title: 'Merge, Split, Compress & Edit PDF Files - PDFConverter',
    description: 'Fast online tools to merge multiple PDFs, compress large files, split pages, rotate, and manage document formats.',
    heading: 'Organize, Merge & Compress Documents',
  },
  'image': {
    name: 'Image Converters',
    title: 'Universal Multi-Format Image Converter - PDFConverter',
    description: 'Find converters by source and output format. Format support, transparency and image quality depend on the tool and browser.',
    heading: 'Image Conversion Suite',
  },
  'utility': {
    name: 'Utilities & Viewers',
    title: 'Online Document Viewers & Editors - PDFConverter',
    description: 'Direct in-browser document previews for Word, Excel, PowerPoint, and live Markdown editing with instant export.',
    heading: 'Document Viewers & Markdown Utilities',
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_METADATA) as ServiceCategory[];

export function getCategory(slug: string) {
  return Object.hasOwn(CATEGORY_METADATA, slug) ? CATEGORY_METADATA[slug as ServiceCategory] : undefined;
}

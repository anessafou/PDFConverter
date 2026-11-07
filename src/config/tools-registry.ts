// src/config/tools-registry.ts
export type ServiceCategory = 
  | 'pdf-to' 
  | 'convert-to-pdf' 
  | 'document' 
  | 'image' 
  | 'utility';

export interface ToolDefinition {
  id: number;
  slug: string;
  name: string;
  category: ServiceCategory;
  inputFormat: string[];
  outputFormat: string;
  description: string;
  badge?: string;
  isClientReady: boolean;
}

export const PSEO_MODIFIERS = [
  'for-mac',
  'for-windows',
  'on-iphone',
  'without-watermark',
] as const;

export type PseoModifier = typeof PSEO_MODIFIERS[number];

export const PSEO_CONFIG: Record<string, readonly PseoModifier[]> = {
  // Office Document Converters
  'word-to-pdf': ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'],
  'pdf-to-word': ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'],
  'excel-to-pdf': ['for-mac', 'for-windows', 'on-iphone'],
  'pdf-to-excel': ['for-mac', 'for-windows'],
  'ppt-to-pdf': ['for-mac', 'for-windows', 'on-iphone'],
  'pdf-to-ppt': ['for-mac', 'for-windows'],
  'doc-to-pdf': ['for-mac', 'for-windows', 'without-watermark'],

  // High-Volume Core PDF Tools
  'merge-pdf': ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'],
  'compress-pdf': ['for-mac', 'for-windows', 'on-iphone', 'without-watermark'],
  'split-pdf': ['for-mac', 'for-windows'],
  'rotate-pdf': ['for-mac', 'for-windows', 'on-iphone'],

  // Image Converters
  'jpg-to-pdf': ['on-iphone', 'for-mac', 'without-watermark'],
  'pdf-to-jpg': ['on-iphone', 'for-mac', 'for-windows'],
  'png-to-pdf': ['on-iphone', 'for-mac', 'without-watermark'],
  'pdf-to-png': ['for-mac', 'for-windows', 'without-watermark'],
  'heic-to-pdf': ['on-iphone', 'for-mac'],
  'heic-to-jpg': ['on-iphone', 'for-mac'],
  'webp-to-jpg': ['for-mac', 'for-windows'],
  'jpg-to-webp': ['for-mac', 'for-windows'],
  'png-to-webp': ['for-mac', 'for-windows'],
  'webp-to-png': ['for-mac', 'for-windows'],
  'svg-to-pdf': ['for-mac', 'for-windows'],
  'svg-to-png': ['for-mac', 'for-windows'],

  // Text, HTML & Scanned Documents
  'html-to-pdf': ['for-mac', 'for-windows'],
  'txt-to-pdf': ['for-mac', 'for-windows'],
  'pdf-to-txt': ['for-mac', 'for-windows'],
  'pdf-to-scanned-document': ['for-mac', 'on-iphone', 'without-watermark'],
};

export function getAllValidPseoSlugs(): string[] {
  const slugs: string[] = [];
  for (const [toolSlug, modifiers] of Object.entries(PSEO_CONFIG)) {
    for (const mod of modifiers) {
      slugs.push(`${toolSlug}-${mod}`);
    }
  }
  return slugs;
}

export const TOOLS_REGISTRY: Record<string, ToolDefinition> = {
  // ─── 1. PDF TO ... (1–26) ──────────────────────────────────────────
  'pdf-to-word': { id: 1, slug: 'pdf-to-word', name: 'PDF to Word', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'docx', description: 'Convert PDF documents to editable Microsoft Word DOCX files.', isClientReady: false },
  'pdf-to-ppt': { id: 2, slug: 'pdf-to-ppt', name: 'PDF to PPT', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'pptx', description: 'Convert PDF files into PowerPoint presentations.', isClientReady: false },
  'pdf-to-excel': { id: 3, slug: 'pdf-to-excel', name: 'PDF to Excel', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'xlsx', description: 'Extract spreadsheet tables from PDF to Excel spreadsheets.', isClientReady: false },
  'pdf-to-txt': { id: 4, slug: 'pdf-to-txt', name: 'PDF to TXT', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'txt', description: 'Extract plain text from your PDF without formatting.', isClientReady: true },
  'pdf-to-rtf': { id: 5, slug: 'pdf-to-rtf', name: 'PDF to RTF', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'rtf', description: 'Convert PDF to Rich Text Format documents.', isClientReady: false },
  'pdf-to-png': { id: 6, slug: 'pdf-to-png', name: 'PDF to PNG', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'png', description: 'Render high-resolution PNG image pages from your PDF.', isClientReady: true },
  'pdf-to-jpg': { id: 7, slug: 'pdf-to-jpg', name: 'PDF to JPG', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'jpg', description: 'Extract pages from PDF to crisp JPG images.', isClientReady: true },
  'pdf-to-long-image': { id: 8, slug: 'pdf-to-long-image', name: 'PDF to Long Image', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'png', description: 'Stitch all PDF pages into a single vertical continuous image.', isClientReady: true },
  'pdf-to-pdfa': { id: 9, slug: 'pdf-to-pdfa', name: 'PDF to PDF/A', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'pdf', description: 'Convert PDF to ISO-compliant PDF/A format for long-term archiving.', isClientReady: false },
  'pdf-to-markdown': { id: 10, slug: 'pdf-to-markdown', name: 'PDF to Markdown', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'md', description: 'Turn PDF text and tables into structured clean Markdown.', isClientReady: true },
  'pdf-to-scanned-document': { id: 11, slug: 'pdf-to-scanned-document', name: 'PDF to Scanned Document', category: 'pdf-to', inputFormat: ['.pdf', '.jpg', '.png', '.webp'], outputFormat: 'pdf', description: 'Convert digital PDFs and documents into realistic scanned files with crop, rotate, photocopy filters, and page reordering.', isClientReady: true },
  'pdf-to-csv': { id: 12, slug: 'pdf-to-csv', name: 'PDF to CSV', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'csv', description: 'Extract tabular PDF data straight into comma-separated values (CSV).', isClientReady: true },
  'pdf-to-xml': { id: 13, slug: 'pdf-to-xml', name: 'PDF to XML', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'xml', description: 'Extract structured contents and tags into an XML schema.', isClientReady: true },
  'pdf-to-json': { id: 14, slug: 'pdf-to-json', name: 'PDF to JSON', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'json', description: 'Parse PDF layout and strings directly into clean JSON.', isClientReady: true },
  'pdf-to-latex': { id: 15, slug: 'pdf-to-latex', name: 'PDF to LaTeX', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'tex', description: 'Convert academic or technical PDFs into LaTeX source code.', isClientReady: false },
  'pdf-to-mobi': { id: 16, slug: 'pdf-to-mobi', name: 'PDF to MOBI', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'mobi', description: 'Format PDFs for older Kindle devices in MOBI eBook format.', isClientReady: false },
  'pdf-to-azw3': { id: 17, slug: 'pdf-to-azw3', name: 'PDF to AZW3', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'azw3', description: 'Convert PDF documents to modern Amazon Kindle AZW3 format.', isClientReady: false },
  'pdf-to-xps': { id: 18, slug: 'pdf-to-xps', name: 'PDF to XPS', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'xps', description: 'Convert PDF documents to Microsoft XML Paper Specification (XPS).', isClientReady: false },
  'pdf-to-ps': { id: 19, slug: 'pdf-to-ps', name: 'PDF to PS', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'ps', description: 'Convert PDF to PostScript vector files for commercial printing.', isClientReady: false },
  'pdf-to-bmp': { id: 20, slug: 'pdf-to-bmp', name: 'PDF to BMP', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'bmp', description: 'Render uncompressed bitmap images from PDF pages.', isClientReady: true },
  'pdf-to-gif': { id: 21, slug: 'pdf-to-gif', name: 'PDF to GIF', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'gif', description: 'Extract animated GIFs or static frames from PDF pages.', isClientReady: true },
  'pdf-to-tiff': { id: 22, slug: 'pdf-to-tiff', name: 'PDF to TIFF', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'tiff', description: 'Convert multi-page PDFs to high-resolution TIFF images.', isClientReady: true },
  'pdf-to-webp': { id: 23, slug: 'pdf-to-webp', name: 'PDF to WebP', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'webp', description: 'Convert PDF pages to lightweight, web-optimized WebP images.', isClientReady: true },
  'pdf-to-epub': { id: 24, slug: 'pdf-to-epub', name: 'PDF to EPUB', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'epub', description: 'Convert fixed-layout PDFs into reflowable standard EPUB eBooks.', isClientReady: false },
  'pdf-to-html': { id: 25, slug: 'pdf-to-html', name: 'PDF to HTML', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'html', description: 'Convert PDF pages into standalone interactive HTML5 code.', isClientReady: true },
  'pdf-to-base64': { id: 26, slug: 'pdf-to-base64', name: 'PDF to Base64', category: 'pdf-to', inputFormat: ['.pdf'], outputFormat: 'txt', description: 'Encode PDF binary files directly into Base64 strings for developers.', isClientReady: true },

  // ─── 2. CONVERT TO PDF (27–47) ─────────────────────────────────────
  'word-to-pdf': { id: 27, slug: 'word-to-pdf', name: 'Word to PDF', category: 'convert-to-pdf', inputFormat: ['.docx', '.doc'], outputFormat: 'pdf', description: 'Convert Microsoft Word documents to PDF.', isClientReady: false },
  'ppt-to-pdf': { id: 28, slug: 'ppt-to-pdf', name: 'PPT to PDF', category: 'convert-to-pdf', inputFormat: ['.pptx', '.ppt'], outputFormat: 'pdf', description: 'Convert PowerPoint slide presentations to PDF.', isClientReady: false },
  'excel-to-pdf': { id: 29, slug: 'excel-to-pdf', name: 'Excel to PDF', category: 'convert-to-pdf', inputFormat: ['.xlsx', '.xls'], outputFormat: 'pdf', description: 'Convert Excel spreadsheets to PDF.', isClientReady: false },
  'txt-to-pdf': { id: 30, slug: 'txt-to-pdf', name: 'TXT to PDF', category: 'convert-to-pdf', inputFormat: ['.txt'], outputFormat: 'pdf', description: 'Convert plain text files into PDF documents.', isClientReady: true },
  'rtf-to-pdf': { id: 31, slug: 'rtf-to-pdf', name: 'RTF to PDF', category: 'convert-to-pdf', inputFormat: ['.rtf'], outputFormat: 'pdf', description: 'Convert Rich Text files to PDF documents.', isClientReady: false },
  'markdown-to-pdf': { id: 32, slug: 'markdown-to-pdf', name: 'Markdown to PDF', category: 'convert-to-pdf', inputFormat: ['.md', '.markdown'], outputFormat: 'pdf', description: 'Convert Markdown notes to styled PDF documents.', isClientReady: true },
  'odp-to-pdf': { id: 33, slug: 'odp-to-pdf', name: 'ODP to PDF', category: 'convert-to-pdf', inputFormat: ['.odp'], outputFormat: 'pdf', description: 'Convert OpenDocument Presentations to PDF.', isClientReady: false },
  'ods-to-pdf': { id: 34, slug: 'ods-to-pdf', name: 'ODS to PDF', category: 'convert-to-pdf', inputFormat: ['.ods'], outputFormat: 'pdf', description: 'Convert OpenDocument Spreadsheets to PDF.', isClientReady: false },
  'odt-to-pdf': { id: 35, slug: 'odt-to-pdf', name: 'ODT to PDF', category: 'convert-to-pdf', inputFormat: ['.odt'], outputFormat: 'pdf', description: 'Convert OpenDocument Text documents to PDF.', isClientReady: false },
  'html-to-pdf': { id: 36, slug: 'html-to-pdf', name: 'HTML to PDF', category: 'convert-to-pdf', inputFormat: ['.html', '.htm'], outputFormat: 'pdf', description: 'Convert HTML files or website code to PDF.', isClientReady: true },
  'epub-to-pdf': { id: 37, slug: 'epub-to-pdf', name: 'EPUB to PDF', category: 'convert-to-pdf', inputFormat: ['.epub'], outputFormat: 'pdf', description: 'Convert EPUB eBooks into printable PDF files.', isClientReady: false },
  'ofd-to-pdf': { id: 38, slug: 'ofd-to-pdf', name: 'OFD to PDF', category: 'convert-to-pdf', inputFormat: ['.ofd'], outputFormat: 'pdf', description: 'Convert Chinese National Open Fixed Layout documents to PDF.', isClientReady: false },
  'caj-to-pdf': { id: 39, slug: 'caj-to-pdf', name: 'CAJ to PDF', category: 'convert-to-pdf', inputFormat: ['.caj'], outputFormat: 'pdf', description: 'Convert CNKI Academic Journal CAJ files to standard PDF.', isClientReady: false },
  'jpg-to-pdf': { id: 40, slug: 'jpg-to-pdf', name: 'JPG to PDF', category: 'convert-to-pdf', inputFormat: ['.jpg', '.jpeg'], outputFormat: 'pdf', description: 'Convert JPG images into a single clean PDF document.', isClientReady: true },
  'png-to-pdf': { id: 41, slug: 'png-to-pdf', name: 'PNG to PDF', category: 'convert-to-pdf', inputFormat: ['.png'], outputFormat: 'pdf', description: 'Convert PNG images with transparency into PDF.', isClientReady: true },
  'svg-to-pdf': { id: 42, slug: 'svg-to-pdf', name: 'SVG to PDF', category: 'convert-to-pdf', inputFormat: ['.svg'], outputFormat: 'pdf', description: 'Convert SVG vector graphics into scalable vector PDFs.', isClientReady: true },
  'tiff-to-pdf': { id: 43, slug: 'tiff-to-pdf', name: 'TIFF to PDF', category: 'convert-to-pdf', inputFormat: ['.tiff', '.tif'], outputFormat: 'pdf', description: 'Convert multi-page TIFF scanned images into PDF.', isClientReady: true },
  'heic-to-pdf': { id: 44, slug: 'heic-to-pdf', name: 'HEIC to PDF', category: 'convert-to-pdf', inputFormat: ['.heic', '.heif'], outputFormat: 'pdf', description: 'Convert iPhone HEIC photos into PDF.', isClientReady: true },
  'webp-to-pdf': { id: 45, slug: 'webp-to-pdf', name: 'WebP to PDF', category: 'convert-to-pdf', inputFormat: ['.webp'], outputFormat: 'pdf', description: 'Convert modern WebP graphics to PDF.', isClientReady: true },
  'cad-to-pdf': { id: 46, slug: 'cad-to-pdf', name: 'CAD to PDF', category: 'convert-to-pdf', inputFormat: ['.dwg', '.dxf'], outputFormat: 'pdf', description: 'Convert AutoCAD DWG and DXF blueprints to PDF.', isClientReady: false },
  'doc-to-pdf': { id: 47, slug: 'doc-to-pdf', name: 'DOC to PDF', category: 'convert-to-pdf', inputFormat: ['.doc'], outputFormat: 'pdf', description: 'Convert legacy Word DOC documents to PDF.', isClientReady: false },

  // ─── 3. DOCUMENT CONVERTERS (48–58) ────────────────────────────────
  'docx-to-odt': { id: 48, slug: 'docx-to-odt', name: 'DOCX to ODT', category: 'document', inputFormat: ['.docx'], outputFormat: 'odt', description: 'Convert Microsoft Word DOCX to OpenOffice ODT.', isClientReady: false },
  'docx-to-txt': { id: 49, slug: 'docx-to-txt', name: 'DOCX to TXT', category: 'document', inputFormat: ['.docx'], outputFormat: 'txt', description: 'Extract plain text from Word DOCX.', isClientReady: true },
  'docx-to-html': { id: 50, slug: 'docx-to-html', name: 'DOCX to HTML', category: 'document', inputFormat: ['.docx'], outputFormat: 'html', description: 'Convert Word DOCX documents into clean web HTML code.', isClientReady: false },
  'docx-to-rtf': { id: 51, slug: 'docx-to-rtf', name: 'DOCX to RTF', category: 'document', inputFormat: ['.docx'], outputFormat: 'rtf', description: 'Convert DOCX files to Rich Text Format (RTF).', isClientReady: false },
  'xlsx-to-csv': { id: 52, slug: 'xlsx-to-csv', name: 'XLSX to CSV', category: 'document', inputFormat: ['.xlsx'], outputFormat: 'csv', description: 'Extract Excel spreadsheets into CSV format.', isClientReady: true },
  'xlsx-to-ods': { id: 53, slug: 'xlsx-to-ods', name: 'XLSX to ODS', category: 'document', inputFormat: ['.xlsx'], outputFormat: 'ods', description: 'Convert Excel spreadsheets to LibreOffice Calc ODS.', isClientReady: false },
  'pptx-to-odp': { id: 54, slug: 'pptx-to-odp', name: 'PPTX to ODP', category: 'document', inputFormat: ['.pptx'], outputFormat: 'odp', description: 'Convert PowerPoint presentations to OpenDocument ODP.', isClientReady: false },
  'pptx-to-jpg': { id: 55, slug: 'pptx-to-jpg', name: 'PPTX to JPG', category: 'document', inputFormat: ['.pptx'], outputFormat: 'jpg', description: 'Convert PowerPoint slides to JPG images.', isClientReady: false },
  'pptx-to-png': { id: 56, slug: 'pptx-to-png', name: 'PPTX to PNG', category: 'document', inputFormat: ['.pptx'], outputFormat: 'png', description: 'Convert PowerPoint slides to clear PNG images.', isClientReady: false },
  'html-to-word': { id: 57, slug: 'html-to-word', name: 'HTML to Word', category: 'document', inputFormat: ['.html', '.htm'], outputFormat: 'docx', description: 'Convert HTML web pages into editable Word DOCX files.', isClientReady: false },
  'epub-to-mobi': { id: 58, slug: 'epub-to-mobi', name: 'EPUB to MOBI', category: 'document', inputFormat: ['.epub'], outputFormat: 'mobi', description: 'Convert EPUB eBooks to Amazon Kindle MOBI format.', isClientReady: false },

  // ─── 4. IMAGE CONVERTERS (59–77) ───────────────────────────────────
  'heic-to-jpg': { id: 59, slug: 'heic-to-jpg', name: 'HEIC to JPG', category: 'image', inputFormat: ['.heic'], outputFormat: 'jpg', description: 'Convert Apple HEIC photos into standard JPG.', isClientReady: true },
  'heic-to-png': { id: 60, slug: 'heic-to-png', name: 'HEIC to PNG', category: 'image', inputFormat: ['.heic'], outputFormat: 'png', description: 'Convert Apple HEIC photos to high-quality PNG.', isClientReady: true },
  'webp-to-png': { id: 61, slug: 'webp-to-png', name: 'WebP to PNG', category: 'image', inputFormat: ['.webp'], outputFormat: 'png', description: 'Convert WebP images to PNG with alpha transparency.', isClientReady: true },
  'png-to-webp': { id: 62, slug: 'png-to-webp', name: 'PNG to WebP', category: 'image', inputFormat: ['.png'], outputFormat: 'webp', description: 'Compress PNG images into lightweight WebP format.', isClientReady: true },
  'jpg-to-png': { id: 63, slug: 'jpg-to-png', name: 'JPG to PNG', category: 'image', inputFormat: ['.jpg', '.jpeg'], outputFormat: 'png', description: 'Convert JPG to PNG image format.', isClientReady: true },
  'png-to-jpg': { id: 64, slug: 'png-to-jpg', name: 'PNG to JPG', category: 'image', inputFormat: ['.png'], outputFormat: 'jpg', description: 'Convert PNG images to standard compressed JPG.', isClientReady: true },
  'jpg-to-webp': { id: 65, slug: 'jpg-to-webp', name: 'JPG to WebP', category: 'image', inputFormat: ['.jpg', '.jpeg'], outputFormat: 'webp', description: 'Convert JPG photos to modern web-optimized WebP.', isClientReady: true },
  'webp-to-jpg': { id: 66, slug: 'webp-to-jpg', name: 'WebP to JPG', category: 'image', inputFormat: ['.webp'], outputFormat: 'jpg', description: 'Convert WebP images back to compatible JPG format.', isClientReady: true },
  'png-to-avif': { id: 67, slug: 'png-to-avif', name: 'PNG to AVIF', category: 'image', inputFormat: ['.png'], outputFormat: 'avif', description: 'Convert PNG to next-generation AVIF format.', isClientReady: true },
  'jpg-to-avif': { id: 68, slug: 'jpg-to-avif', name: 'JPG to AVIF', category: 'image', inputFormat: ['.jpg', '.jpeg'], outputFormat: 'avif', description: 'Compress JPG images into next-gen AVIF format.', isClientReady: true },
  'avif-to-jpg': { id: 69, slug: 'avif-to-jpg', name: 'AVIF to JPG', category: 'image', inputFormat: ['.avif'], outputFormat: 'jpg', description: 'Convert AVIF images into universally supported JPG.', isClientReady: true },
  'avif-to-png': { id: 70, slug: 'avif-to-png', name: 'AVIF to PNG', category: 'image', inputFormat: ['.avif'], outputFormat: 'png', description: 'Convert AVIF files to losslessly decompressed PNG.', isClientReady: true },
  'tiff-to-jpg': { id: 71, slug: 'tiff-to-jpg', name: 'TIFF to JPG', category: 'image', inputFormat: ['.tiff', '.tif'], outputFormat: 'jpg', description: 'Convert uncompressed TIFF images into manageable JPG.', isClientReady: true },
  'tiff-to-png': { id: 72, slug: 'tiff-to-png', name: 'TIFF to PNG', category: 'image', inputFormat: ['.tiff', '.tif'], outputFormat: 'png', description: 'Convert TIFF graphics to transparent PNG images.', isClientReady: true },
  'bmp-to-jpg': { id: 73, slug: 'bmp-to-jpg', name: 'BMP to JPG', category: 'image', inputFormat: ['.bmp'], outputFormat: 'jpg', description: 'Convert Windows Bitmap (BMP) images into compact JPG.', isClientReady: true },
  'svg-to-png': { id: 74, slug: 'svg-to-png', name: 'SVG to PNG', category: 'image', inputFormat: ['.svg'], outputFormat: 'png', description: 'Rasterize SVG vector illustrations to transparent PNG.', isClientReady: true },
  'svg-to-jpg': { id: 75, slug: 'svg-to-jpg', name: 'SVG to JPG', category: 'image', inputFormat: ['.svg'], outputFormat: 'jpg', description: 'Rasterize SVG vector art into standard JPG.', isClientReady: true },
  'ico-to-png': { id: 76, slug: 'ico-to-png', name: 'ICO to PNG', category: 'image', inputFormat: ['.ico'], outputFormat: 'png', description: 'Extract website favicon ICO files into editable PNG.', isClientReady: true },
  'gif-to-webp': { id: 77, slug: 'gif-to-webp', name: 'GIF to WebP', category: 'image', inputFormat: ['.gif'], outputFormat: 'webp', description: 'Convert heavy GIF animations into lightweight animated WebP.', isClientReady: true },

  // ─── 5. ADDITIONAL UTILITIES (78–80) ───────────────────────────────
  'markdown-editor': { id: 78, slug: 'markdown-editor', name: 'Markdown Editor', category: 'utility', inputFormat: ['.md', '.txt'], outputFormat: 'md', description: 'Interactive browser-based live Markdown editor and previewer.', isClientReady: true },
  'image-converter': { id: 79, slug: 'image-converter', name: 'Image Converter', category: 'utility', inputFormat: ['.jpg', '.png', '.webp', '.avif', '.bmp'], outputFormat: 'png', description: 'Universal multi-format bulk image converter.', isClientReady: true },
  'view-documents-online': {
    id: 80,
    slug: 'view-documents-online',
    name: 'View Documents Online',
    category: 'utility',
    inputFormat: ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.csv', '.md', '.json', '.png', '.jpg', '.webp'],
    outputFormat: 'preview',
    description: 'Open and preview PDF, Word DOCX, Excel XLSX, PPTX, and images directly in your browser without software.',
    isClientReady: true,
  },

  // ─── 6. HIGH-VOLUME CORE PDF TOOLS (81–86) ─────────────────────────
  'merge-pdf': {
    id: 81,
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Combine multiple PDF files into a single organized document in your chosen order.',
    isClientReady: true,
  },
  'compress-pdf': {
    id: 82,
    slug: 'compress-pdf',
    name: 'Compress PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Reduce PDF file size significantly while retaining high vector text and image quality.',
    isClientReady: true,
  },
  'split-pdf': {
    id: 83,
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Extract selected pages or divide large PDF documents into separate individual files.',
    isClientReady: true,
  },
  'rotate-pdf': {
    id: 84,
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Rotate PDF pages clockwise or counterclockwise 90, 180, or 270 degrees permanently.',
    isClientReady: true,
  },
  'protect-pdf': {
    id: 85,
    slug: 'protect-pdf',
    name: 'Protect PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Encrypt your PDF with standard AES-128/256 password protection to prevent unauthorized access.',
    isClientReady: true,
  },
  'unlock-pdf': {
    id: 86,
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'document',
    inputFormat: ['.pdf'],
    outputFormat: 'pdf',
    description: 'Remove password security and editing restrictions from PDFs you have authorization to unlock.',
    isClientReady: true,
  },
};
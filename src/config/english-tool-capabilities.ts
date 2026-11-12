import type { ToolDefinition } from './tools-registry';
import { getPseoToolCapability } from './pseo-publication';

export function englishToolCapability(tool: ToolDefinition) {
  const descriptions: Record<string, string> = {
    'merge-pdf': 'Combine 2–20 PDF files in input order and download one PDF. There is no visual page-reordering control.',
    'split-pdf': 'Export every page as a separate PDF in a ZIP archive. The current widget does not select page ranges.',
    'rotate-pdf': 'Rotate every page 90 degrees clockwise and download a new PDF. Individual-page and angle controls are not available.',
    'pdf-to-txt': 'Extract embedded, selectable PDF text to a TXT file. Scanned images need OCR, which this browser operation does not provide.',
    'pdf-to-markdown': 'Save extracted PDF text as a Markdown file without reconstructing headings, tables or the original layout.',
    'pdf-to-json': 'Extract embedded PDF text into JSON pages with page numbers and text. This is not invoice-field or table parsing.',
    'pdf-to-xml': 'Extract embedded PDF text into page/text XML. It does not reproduce a specialist XML schema or document layout.',
    'pdf-to-html': 'Export embedded PDF text in a preformatted HTML document, without reconstructing the page layout.',
    'pdf-to-base64': 'Encode the original PDF bytes into a Base64 text file. Base64 is an encoding, not encryption.',
    'pdf-to-long-image': 'Render PDF pages into one vertically stacked PNG, subject to the rendering and image-height limits.',
    'docx-to-txt': 'Extract raw text from DOCX without retaining document formatting.',
    'docx-to-html': 'Convert DOCX content into logical HTML; exact Word page layout is not preserved.',
    'xlsx-to-csv': 'Export a CSV for each worksheet. A workbook with multiple worksheets downloads as a ZIP; formatting is not retained.',
  };
  const render = ['pdf-to-jpg', 'pdf-to-png', 'pdf-to-webp', 'pdf-to-bmp'].includes(tool.slug);
  const imagePdf = ['jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'svg-to-pdf', 'bmp-to-pdf'].includes(tool.slug);
  const image = ['webp-to-png', 'png-to-webp', 'jpg-to-png', 'png-to-jpg', 'jpg-to-webp', 'webp-to-jpg', 'bmp-to-jpg', 'svg-to-png', 'svg-to-jpg', 'ico-to-png'].includes(tool.slug);
  const capability = getPseoToolCapability(tool.slug);
  const conditional = capability === 'browser-dependent';
  const browser = capability === 'browser-implemented';
  const mode = browser ? 'browser' : conditional ? 'browser-dependent' : 'service';
  const input = tool.inputFormat.join(', ');
  const output = tool.outputFormat.toUpperCase();
  const summary = descriptions[tool.slug] || (render
    ? `Render complete PDF pages as ${output}. A one-page input produces an image; multiple pages produce a ZIP. This does not extract original embedded pictures.`
    : imagePdf ? `Convert one supported image into a PDF. SVG is rasterized; multiple-photo PDF assembly is not provided by this widget.`
    : image ? `Convert the supported image to ${output} using browser rendering. SVG is rasterized, and animation is not preserved.`
    : conditional ? `Conversion depends on your browser’s ability to decode and encode these formats. Unsupported formats show an error rather than a renamed output.`
    : `This conversion uses an online conversion service. Availability and successful output depend on that service; browser-only conversion is not provided for this operation.`);
  const privacy = mode === 'service' ? 'This operation sends the selected file to a conversion service. Do not assume that a browser-only privacy statement applies.' : mode === 'browser-dependent' ? 'When supported by your browser, this image operation processes the image locally. Format support varies.' : 'This operation processes the selected file in browser memory. The website still needs to load its application resources.';
  const limits = render || tool.slug === 'pdf-to-long-image' ? '25 MB per input file; PDF rendering also has a 40-megapixel budget.' : tool.slug === 'merge-pdf' ? '2–20 PDFs, each no larger than 25 MB.' : '25 MB per input file.';
  const choose = tool.slug === 'merge-pdf' ? 'Choose 2–20 PDF files in the intended input order.' : `Choose one non-empty ${input} file that meets the size limit.`;
  const result = tool.slug === 'split-pdf' ? 'Download the ZIP and extract it to obtain one PDF per page.' : render ? 'Download the image for a one-page input, or extract the ZIP for a multi-page PDF.' : tool.slug === 'xlsx-to-csv' ? 'Download the CSV for a single worksheet, or extract the ZIP of worksheet CSVs.' : `Download and open the resulting ${output} file to check it before sharing.`;
  return { mode, summary, privacy, limits, input, output, choose, result };
}

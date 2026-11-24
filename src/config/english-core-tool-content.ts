import { ENGLISH_SERVICE_EDITORIAL } from './english-service-editorial';
export interface EnglishCoreToolStep {
  title: string;
  body: string;
}

export interface EnglishCoreToolGuide {
  heading: string;
  introduction: string;
  stepsHeading: string;
  steps: readonly EnglishCoreToolStep[];
  guidanceHeading: string;
  guidance: string;
}

const guides: Record<string, EnglishCoreToolGuide> = {
  ...Object.fromEntries(Object.entries(ENGLISH_SERVICE_EDITORIAL).map(([slug, copy]) => [slug, { ...copy, introduction: copy.description }])),
  'pdf-to-jpg': {
    heading: 'How to convert PDF to JPG',
    introduction: 'Convert every page of a PDF to a separate JPG image. The PDF to JPG converter runs in your browser; a one-page file gives you one image, while a multi-page file is packaged as a ZIP.',
    stepsHeading: 'Convert and download your JPG images',
    steps: [
      { title: 'Choose a PDF', body: 'Select one PDF that is 25 MB or smaller. The converter processes the whole document, so it does not have a page-range selector.' },
      { title: 'Start the conversion', body: 'Select “Convert to JPG Now” and keep this browser tab open while the pages are rendered. The combined rendered output must stay within 40 megapixels.' },
      { title: 'Download the result', body: 'A one-page PDF downloads as a JPG. For a PDF with multiple pages, download the ZIP and extract it to get one JPG for each page.' },
      { title: 'Check the images', body: 'Open the JPGs and confirm that the pages you need are present and readable before sharing or uploading them.' },
    ],
    guidanceHeading: 'Output and limits',
    guidance: 'Each PDF input is limited to 25 MB, and all rendered pages together are limited to 40 megapixels. If the conversion reaches the rendering limit, use a smaller or shorter PDF; this tool cannot convert only selected pages.',
  },
  'merge-pdf': {
    heading: 'How to merge PDF files',
    introduction: 'Use Merge PDF to combine 2–20 PDF files into one document in your browser. Pages are added in the order of files supplied by the browser file list; that order is not guaranteed to match the order in which you click files in the picker.',
    stepsHeading: 'Combine PDFs and check their order',
    steps: [
      { title: 'Select the source PDFs together', body: 'Choose at least 2 and no more than 20 PDF files. Each file must be 25 MB or smaller.' },
      { title: 'Check the browser-provided file list', body: 'The browser supplies the file order used for merging. It may differ from your click sequence, and this page has no control to reorder files after selection.' },
      { title: 'Merge the files', body: 'Select “Convert to PDF Now” and leave the tab open while the browser copies the pages from each source PDF into one document.' },
      { title: 'Download and review the merged PDF', body: 'Open the single output PDF and check that its file sequence and page boundaries are right before using it.' },
    ],
    guidanceHeading: 'What the merged PDF contains',
    guidance: 'The output is one PDF containing the pages from each file in the order reported by the browser file list. The picker does not guarantee that this matches the order in which you clicked the files. There is no file-reordering control after selection, so inspect the merged PDF to verify its sequence.',
  },
  'pdf-to-png': {
    heading: 'How to convert PDF to PNG',
    introduction: 'Convert each page of a PDF into a PNG image. The PDF to PNG converter renders the complete document in your browser; it downloads one PNG for a one-page PDF or a ZIP for a multi-page PDF.',
    stepsHeading: 'Create PNG images from your PDF',
    steps: [
      { title: 'Choose the PDF', body: 'Select one PDF no larger than 25 MB. This tool converts all pages and does not let you choose a page range.' },
      { title: 'Render the pages', body: 'Select “Convert to PNG Now” and keep the tab open while the browser renders each page. The total rendered output is limited to 40 megapixels.' },
      { title: 'Save the PNG or ZIP', body: 'Download the PNG directly when the PDF has one page. For multiple pages, download and extract the ZIP to get one PNG per page.' },
      { title: 'Use the images for your task', body: 'PNG is a lossless image format that can suit text, diagrams, and graphics. The result is still a raster image of each page, not selectable PDF text.' },
    ],
    guidanceHeading: 'Output and limits',
    guidance: 'The PDF input limit is 25 MB and the combined rendering limit is 40 megapixels. If a document exceeds the rendering budget, use a smaller or shorter PDF. All pages are included; there is no page-selection control.',
  },
  'split-pdf': {
    heading: 'How to split a PDF into separate pages',
    introduction: 'Split PDF creates a separate PDF for every page in the source document. The browser packages the page files into one ZIP download so you can extract them together.',
    stepsHeading: 'Create and extract the page PDFs',
    steps: [
      { title: 'Choose the source PDF', body: 'Select one PDF that is 25 MB or smaller. The current tool processes the complete document.' },
      { title: 'Start the split', body: 'Select “Convert to PDF Now” and keep the browser tab open while each page is copied into its own PDF file.' },
      { title: 'Download the ZIP', body: 'The result is a ZIP named from the source file and containing files such as “document-page-1.pdf”, one for each page.' },
      { title: 'Extract and check the files', body: 'Open the ZIP in your device’s archive utility, then check the page files you need. The tool does not select a page range or create a custom group of pages.' },
    ],
    guidanceHeading: 'What this split tool does',
    guidance: 'Every page is exported separately and included in the ZIP. You cannot choose only certain pages or combine selected pages into a new group with this interface. The input PDF limit is 25 MB.',
  },
  'rotate-pdf': {
    heading: 'How to rotate PDF pages',
    introduction: 'Rotate PDF turns every page in the document 90° clockwise and saves a new PDF. The conversion runs in your browser, and the original file is not replaced.',
    stepsHeading: 'Rotate and save the PDF',
    steps: [
      { title: 'Choose the PDF', body: 'Select one PDF file no larger than 25 MB.' },
      { title: 'Run the rotation', body: 'Select “Convert to PDF Now” and keep the tab open while the browser updates the page orientation throughout the document.' },
      { title: 'Download the new PDF', body: 'The tool creates a new PDF with every page turned 90° clockwise. The source file remains separate.' },
      { title: 'Review the page orientation', body: 'Open the downloaded PDF and check each page. The current interface cannot rotate only selected pages or choose a different angle.' },
    ],
    guidanceHeading: 'Rotation controls and limit',
    guidance: 'The page applies one 90° clockwise turn to every page; there are no individual-page or angle controls in the current interface. The PDF input limit is 25 MB.',
  },
};

export function getEnglishCoreToolGuide(toolSlug: string): EnglishCoreToolGuide | null {
  return Object.hasOwn(guides, toolSlug) ? guides[toolSlug] : null;
}

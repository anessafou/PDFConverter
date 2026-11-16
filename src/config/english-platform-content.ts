import type { ToolDefinition, PseoModifier } from './tools-registry';
import { englishToolCapability } from './english-tool-capabilities';

type PlatformStep = { num: string; title: string; desc: string };
type PlatformFaq = { q: string; a: string };
type PlatformContent = {
  heroBadge: string;
  guideTitle: string;
  guideText: string;
  steps: PlatformStep[];
  specs: { label: string; value: string }[];
  faqs: PlatformFaq[];
  h1?: string;
  h1Accent?: string;
  metaTitle?: string;
  metaDescription?: string;
};
type PlatformOverride = Partial<{
  heroBadge: string;
  h1: string;
  h1Accent: string;
  metaTitle: string;
  metaDescription: string;
  guideTitle: string;
  guideText: string;
  steps: PlatformStep[];
  faqs: PlatformFaq[];
}>;

// Exact page overrides keep high-priority US workflows useful without changing
// the shared copy on other tools, modifiers, or languages.
const platformOverrides: Record<string, Partial<Record<PseoModifier, PlatformOverride>>> = {
  'pdf-to-jpg': {
    'on-iphone': {
      heroBadge: 'PDF to JPG on iPhone',
      guideTitle: 'Convert every PDF page to JPG on iPhone',
      guideText: 'Use the PDF to JPG converter on iPhone to render every page of one PDF. A one-page file downloads as a JPG; a multi-page file downloads as a ZIP with one JPG per page. The page does not select page ranges.',
      steps: [
        { num: '1', title: 'Choose a PDF from Files', desc: 'Open the file picker and select a readable PDF from Files or another location your browser can access. Each input file must be 25 MB or smaller.' },
        { num: '2', title: 'Convert all pages', desc: 'Start the conversion and keep the page open. The browser renders every page as JPG; it does not offer a page-range selector. Total rendered output is limited to 40 megapixels.' },
        { num: '3', title: 'Save the JPG or ZIP', desc: 'A one-page PDF produces one JPG. A multi-page PDF produces a ZIP containing one JPG for each page. Use your browser download controls or Downloads in Files to locate the saved result.' },
      ],
      faqs: [
        { q: 'How do I convert a PDF to JPG on iPhone?', a: 'Choose the PDF from Files, start the conversion, then download the JPG. The tool renders every page; it does not convert only a selected range.' },
        { q: 'What happens to a multi-page PDF?', a: 'Each PDF page becomes a separate JPG. The browser downloads the images in a ZIP archive so they can be saved together.' },
        { q: 'Can I choose specific PDF pages?', a: 'No. The current converter renders all pages and does not provide page selection.' },
        { q: 'What are the input limits?', a: 'Each PDF must be 25 MB or smaller. Rendering also stops if the combined page output exceeds 40 megapixels.' },
      ],
    },
    'for-windows': {
      heroBadge: 'PDF to JPG for Windows',
      guideTitle: 'Convert PDF to JPG on Windows',
      guideText: 'Convert a PDF in your Windows browser without installing a desktop converter. This tool renders every page: one page downloads as a JPG, while multiple pages are packaged as a ZIP. Page-range selection is not available.',
      steps: [
        { num: '1', title: 'Select the source PDF', desc: 'Use Choose File to open the Windows file picker and select a readable PDF. The input limit is 25 MB per file.' },
        { num: '2', title: 'Render the document', desc: 'Run the conversion and leave the browser tab open. All pages are rendered as JPG; the tool has no page-range control. Combined rendered output is limited to 40 megapixels.' },
        { num: '3', title: 'Open the download', desc: 'Download the JPG for a one-page PDF or the ZIP for a multi-page PDF. Check your browser download list or its configured Downloads folder.' },
      ],
      faqs: [
        { q: 'How do I convert PDF to JPG on Windows?', a: 'Select a PDF in the file picker, run the conversion, and download the resulting image or ZIP. The converter runs in the browser.' },
        { q: 'Does each PDF page become a separate JPG?', a: 'Yes. The converter renders every page. For multiple pages, the JPG files are delivered together in a ZIP archive.' },
        { q: 'Can I convert only a page range?', a: 'No. This page converts the complete PDF and has no page-range selector.' },
        { q: 'Where is the converted file?', a: 'Use the browser download list to open the file or its configured Downloads folder. The exact location depends on browser settings.' },
      ],
    },
  },
  'jpg-to-pdf': {
    'on-iphone': {
      heroBadge: 'JPG to PDF on iPhone',
      guideTitle: 'Turn one JPG image into a PDF on iPhone',
      guideText: 'Convert one JPG or JPEG image into a one-page PDF in your browser. The page follows the image dimensions. This tool does not combine a batch of photos into a multi-page PDF or provide crop and resize controls.',
      steps: [
        { num: '1', title: 'Choose one JPG image', desc: 'Select a .jpg or .jpeg file from Files or another location available to your browser. The input must be 25 MB or smaller and no larger than 40 megapixels.' },
        { num: '2', title: 'Create the PDF', desc: 'Start the conversion and keep the page open while the image is rendered into a single PDF page. There is no multi-photo queue on this tool page.' },
        { num: '3', title: 'Download and check the PDF', desc: 'Download the new PDF from your browser. Open it to check the page size and image orientation before sharing.' },
      ],
      faqs: [
        { q: 'How do I convert a JPG to PDF on iPhone?', a: 'Choose one .jpg or .jpeg image, convert it, and download the resulting one-page PDF.' },
        { q: 'Can I combine several iPhone photos into one PDF?', a: 'No. This converter accepts one image per conversion and creates a one-page PDF. It has no multi-photo assembly control.' },
        { q: 'Does the PDF keep the image dimensions?', a: 'The PDF page is created using the decoded image width and height. The current tool has no crop or resize setting.' },
        { q: 'What image files can I select?', a: 'This tool accepts JPG and JPEG files. Each input is limited to 25 MB and 40 megapixels.' },
      ],
    },
  },
  'merge-pdf': {
    'on-iphone': {
      heroBadge: 'Merge PDFs on iPhone',
      guideTitle: 'Merge PDF files on iPhone from the browser file picker',
      guideText: 'Choose 2–20 PDFs that your iPhone browser can access (25 MB maximum each). The merge uses the browser-provided file list, which may differ from tap order; you cannot reorder files after selection.',
      steps: [
        { num: '1', title: 'Choose the PDFs from Files', desc: 'Use the browser file picker to select 2–20 readable PDF files available on your iPhone. Each selected file must be 25 MB or smaller.' },
        { num: '2', title: 'Check the browser-provided file list', desc: 'This list sets merge order and may differ from tap order. There is no post-selection reorder control, so inspect the result afterward.' },
        { num: '3', title: 'Merge and save the new PDF', desc: 'Start the merge and keep the browser page open until the download is ready. Use the browser download controls to open or save the resulting PDF.' },
      ],
      faqs: [
        { q: 'How do I merge PDF files on iPhone?', a: 'Open this page in your browser, choose 2–20 PDFs that the file picker can access, then run the merge. The result is one PDF downloaded through your browser.' },
        { q: 'Can I merge PDFs stored in the Files app?', a: 'Select PDFs from Files or another location offered by the browser file picker. Availability depends on where the file is stored and what the browser exposes to the page.' },
        { q: 'Can I change the page order after selecting files?', a: 'The output follows browser-provided file order, which may differ from tap order. The page has no reorder control; check the merged PDF before sharing.' },
        { q: 'How many PDFs can I merge on iPhone?', a: 'Choose at least 2 and no more than 20 PDFs. Each input file must be 25 MB or smaller.' },
        { q: 'Where is the merged PDF saved?', a: 'The browser starts the download. Use its download controls to open or save the result; the exact prompt and location depend on your browser settings.' },
      ],
    },
    'for-windows': {
      heroBadge: 'Merge PDFs in a Windows browser',
      guideTitle: 'Merge PDF files on Windows and check the browser file order',
      guideText: 'Merge 2–20 PDFs into one file using the browser-based tool. Each PDF can be up to 25 MB. The merge follows the file list supplied by the browser, which is not guaranteed to match the order in which you select files. There is no visual reorder control.',
      steps: [
        { num: '1', title: 'Select 2–20 PDF files', desc: 'Choose the files from File Explorer using the browser picker. Each input must be 25 MB or smaller. The browser determines the order in which it supplies the selected file list.' },
        { num: '2', title: 'Check the browser-provided file list', desc: 'Its order is not guaranteed to match your selection sequence. This page has no control to reorder files after selection, so inspect the merged PDF afterward.' },
        { num: '3', title: 'Merge and download', desc: 'Start the merge and keep the tab open. The browser combines the PDFs and downloads one PDF; open it to check the document sequence.' },
      ],
      faqs: [
        { q: 'How many PDFs can I merge at once?', a: 'Select at least 2 and no more than 20 PDF files. Each file must be 25 MB or smaller.' },
        { q: 'Can I change the order after selecting the PDFs?', a: 'The result follows browser-provided file order, which may differ from your selection sequence. There is no post-selection reorder control.' },
        { q: 'Does the merge create one file or a ZIP?', a: 'It creates one merged PDF. Pages are copied in the order reported by the browser file list.' },
        { q: 'Does the merge run in the browser?', a: 'The merge operation uses the browser-side PDF library. Keep the page open until the download is ready.' },
      ],
    },
    'without-watermark': {
      heroBadge: 'Merge PDFs without adding a watermark',
      h1: 'Merge PDFs without adding a watermark',
      h1Accent: 'without adding a watermark',
      metaTitle: 'Merge PDFs Without Adding a Watermark | PDFConverter',
      metaDescription: 'Merge 2–20 PDFs in the browser without adding a watermark. Source page content is copied; inspect the result for annotation-based marks. Each input is limited to 25 MB.',
      guideTitle: 'Merge PDF files without adding a new watermark',
      guideText: 'This browser-based merge combines 2–20 PDFs into one file and does not add a new watermark. It copies source page content; PDF marks can also be stored as annotations, so inspect the result if an existing mark needs to be retained. Each file must be 25 MB or smaller.',
      steps: [
        { num: '1', title: 'Choose 2–20 source PDFs', desc: 'Select the PDF files to combine. Each file must be 25 MB or smaller; the tool accepts at most 20 files per merge.' },
        { num: '2', title: 'Check file order and source marks', desc: 'The browser-provided file list sets document order and may differ from selection order. The merge adds no watermark; inspect the result if source marks stored as annotations matter.' },
        { num: '3', title: 'Merge and inspect the result', desc: 'Run the merge and download the single PDF. Open it and check page order and existing marks before sharing.' },
      ],
      faqs: [
        { q: 'Does merging these PDFs add a watermark?', a: 'No. The merge operation copies the source pages into one PDF and does not add a new watermark.' },
        { q: 'Will it remove watermarks already in my PDFs?', a: 'This tool has no watermark-removal control and copies source page content. Some marks may be stored as annotations, so inspect the merged file to confirm a mark remains visible.' },
        { q: 'How many PDFs can I merge without a new watermark?', a: 'You can merge 2–20 PDF files, with a maximum of 25 MB per input file.' },
        { q: 'Does the merged file keep my selected order?', a: 'It follows the browser-provided file list, which may differ from selection order. There is no reorder control.' },
      ],
    },
  },
  'rotate-pdf': {
    'on-iphone': {
      heroBadge: 'Rotate a PDF on iPhone',
      guideTitle: 'Rotate a PDF on iPhone: 90° clockwise for every page',
      guideText: 'Use the browser tool to save a rotated copy of a PDF on iPhone. The current page turns every page 90° clockwise in one operation; it does not offer per-page selection or an angle menu.',
      steps: [
        { num: '1', title: 'Choose the PDF from Files', desc: 'Select a readable PDF that your browser can access. The file must be 25 MB or smaller.' },
        { num: '2', title: 'Apply the clockwise rotation', desc: 'Start the conversion. Every page is rotated 90° clockwise; you cannot choose an individual page or change the angle in this interface.' },
        { num: '3', title: 'Download and inspect the copy', desc: 'Save the new PDF through your browser’s download controls, then reopen it to check that the page orientation is suitable.' },
      ],
      faqs: [
        { q: 'How do I rotate a PDF on iPhone?', a: 'Choose the PDF, run the rotation, and download the new file. The current tool rotates all pages 90° clockwise.' },
        { q: 'Can I rotate just one page?', a: 'No. This interface applies the rotation to every page in the PDF.' },
        { q: 'Can I choose a different angle?', a: 'The current page has no angle selector. It applies a 90° clockwise turn.' },
        { q: 'Where do I find the rotated PDF?', a: 'Use the browser download controls or its configured Downloads location. Open the saved file to check its orientation.' },
      ],
    },
  },
  'split-pdf': {
    'for-windows': {
      heroBadge: 'Split every PDF page on Windows',
      guideTitle: 'Split PDF on Windows into one file per page',
      guideText: 'This browser tool exports every page of a PDF as a separate PDF and places the files in a ZIP. It does not extract a custom page range or selected pages.',
      steps: [
        { num: '1', title: 'Choose one PDF', desc: 'Select a readable PDF from your Windows device. Each input file must be 25 MB or smaller.' },
        { num: '2', title: 'Split the complete document', desc: 'Run the conversion. The tool creates one PDF for every page; it has no page-range or selected-page control.' },
        { num: '3', title: 'Download and extract the ZIP', desc: 'Download the ZIP from your browser, then open it from the browser download list or Downloads folder to access the individual page PDFs.' },
      ],
      faqs: [
        { q: 'How does Split PDF work on Windows?', a: 'Choose a PDF and convert it. The browser prepares a ZIP containing one PDF for each page of the document.' },
        { q: 'Can I split only selected pages?', a: 'No. The current tool processes every page and does not accept a page range.' },
        { q: 'Why is the result a ZIP file?', a: 'A document can produce many page PDFs, so the converter packages them together in one ZIP download.' },
        { q: 'What is the file-size limit?', a: 'The selected PDF must be 25 MB or smaller. Keep the browser tab open until the ZIP is ready.' },
      ],
    },
  },
};

export function getPlatformContent(tool: ToolDefinition, modifier: PseoModifier) {
  const capability = englishToolCapability(tool);
  const labels = { 'for-mac': 'Mac', 'for-windows': 'Windows', 'on-iphone': 'iPhone', 'without-watermark': 'Watermarks' };
  const platform = labels[modifier];
  const sourceStep = modifier === 'on-iphone'
    ? `Use the file picker to choose a supported file from Files or available storage. ${capability.choose} Check the file extension before uploading.`
    : modifier === 'for-windows'
      ? `${capability.choose} If the extension is hidden, show file name extensions in File Explorer before opening the picker.`
      : modifier === 'for-mac'
        ? `${capability.choose} If the file is only in iCloud Drive, make sure it is available to open from Finder.`
        : capability.choose;
  const processing = capability.mode === 'service' ? 'Conversion service' : capability.mode === 'browser-dependent' ? 'Depends on browser format support' : 'Browser processing';
  const base: PlatformContent = {
    heroBadge: modifier === 'without-watermark' ? 'Check the exported file for existing marks' : `${platform} browser workflow`,
    guideTitle: modifier === 'without-watermark' ? `${tool.name}: understand the exported file` : `How to use ${tool.name} on ${platform}`,
    guideText: `${capability.summary} ${modifier === 'without-watermark' ? 'This is not a tool for removing existing source watermarks.' : `Use this web interface from a current browser on ${platform}; no desktop converter installation is required.`}`,
    steps: [
      { num: '1', title: tool.slug === 'merge-pdf' ? 'Choose the PDF inputs' : 'Choose a supported source', desc: sourceStep },
      { num: '2', title: 'Run the supported operation', desc: capability.summary },
      { num: '3', title: 'Download and check the output', desc: `${capability.mode === 'service' ? 'If the service returns a download, open it in the intended app and verify its contents.' : capability.result} ${modifier === 'on-iphone' ? 'Use the browser download controls to locate the saved file in Files; the exact prompt depends on your browser settings.' : 'Use your browser download list to locate the saved file.'}` },
    ],
    specs: [
      { label: 'Supported input', value: capability.input },
      { label: 'Input limits', value: capability.limits },
      { label: 'Processing', value: processing },
      { label: 'Output type', value: capability.output },
    ],
    faqs: [
      { q: `Which files can I use with ${tool.name}?`, a: `${capability.choose} ${capability.limits}` },
      { q: `What will ${tool.name} download?`, a: `${capability.summary} ${capability.result}` },
      { q: `Does ${tool.name} process my file only in this browser?`, a: capability.privacy },
      modifier === 'without-watermark'
        ? { q: 'Does this remove a watermark already in my document?', a: 'This page has no watermark-removal control. If the source already contains a mark, inspect the downloaded result before using it.' }
        : { q: `Do I need to install a ${platform} conversion app?`, a: `This website provides the upload and download interface in your browser. ${capability.mode === 'service' ? 'The conversion itself needs an available online conversion service.' : 'Use a current browser, keep the page open and check the supported formats and output before relying on the result.'}` },
    ],
  };

  const override = platformOverrides[tool.slug]?.[modifier];
  return override ? { ...base, ...override, specs: base.specs } : base;
}

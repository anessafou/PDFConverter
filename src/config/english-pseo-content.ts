import { findEnglishIntent, type EnglishIntentSlug } from './english-pseo-index';

export interface EnglishIntentContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
  widget: 'images' | 'converter';
  initialFormat?: 'PNG' | 'JPG' | 'WEBP' | 'BMP' | 'ICO';
  facts: { label: string; value: string }[];
  steps: { title: string; text: string }[];
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
  comparison?: { format: string; usefulFor: string; transparency: string; output: string }[];
}

const CONTENT: Record<EnglishIntentSlug, EnglishIntentContent> = {
  'image-converter-images-to-ico': {
    title: 'PNG & JPG to ICO Converter - Create Icon Files | PDFConverter',
    description: 'Create an ICO file from a PNG or JPG in your browser. Learn about transparency, the 256-pixel size limit and the single-image icon output.',
    h1: 'Create ICO files from PNG or JPG images',
    intro: 'Turn an existing logo or small graphic into an actual .ico file. The converter packages a PNG image inside an ICO container; it does not simply rename your original file. Choose ICO below, add your artwork, then download the resulting icon.',
    widget: 'images', initialFormat: 'ICO',
    facts: [{ label: 'Useful inputs', value: 'PNG, JPG / JPEG' }, { label: 'Output', value: 'Single-image ICO' }, { label: 'Largest dimension', value: 'Up to 256 pixels' }, { label: 'Transparency', value: 'Preserved from PNG' }],
    steps: [
      { title: 'Prepare a square source image', text: 'Use artwork that is already cropped as you want it. A square PNG is a practical starting point for an icon, especially if you need transparent corners. The converter does not crop or add square padding for you.' },
      { title: 'Select ICO and add your images', text: 'ICO is selected for this workflow. Choose your PNG or JPG files, or drop them into the image queue. Review the target format shown beside each queued file before converting.' },
      { title: 'Convert the queued artwork', text: 'Select Convert All to ICO. Images larger than 256 pixels on either side are scaled proportionally so their largest dimension fits within 256 pixels. Smaller images retain their dimensions.' },
      { title: 'Download and check the icon', text: 'Download each converted .ico file, or collect completed files in a ZIP. Open or assign the icon in the application that will use it; requirements can differ between desktop apps and websites.' },
    ],
    sections: [
      { heading: 'PNG or JPEG: which source should you choose?', paragraphs: ['PNG can carry an existing transparent background into the embedded icon image. JPEG has no alpha transparency, so a JPEG source remains an opaque rectangle. Converting a JPEG to ICO does not remove its background.', 'Keep the original artwork. Reducing a large illustration to an icon can make small text and fine lines difficult to read. Start with a simple symbol and inspect the downloaded result at its intended display size.'] },
      { heading: 'A single-image icon, not a complete favicon package', paragraphs: ['This export contains one PNG-backed icon image. It does not generate a collection of separate 16×16, 32×32 and other resolutions, an Apple touch icon, or a web app manifest. Applications that require a specific multi-resolution icon bundle may need another workflow.', 'To use the file on a website, you still need to place it in that website and configure the appropriate icon link. Downloading an ICO does not update your site automatically.'] },
    ],
    faqs: [
      { q: 'How do I change a PNG to ICO?', a: 'Select ICO, add the PNG to the queue, choose Convert All to ICO and download the completed file. Use an already square source if the receiving application expects a square icon.' },
      { q: 'Can I convert JPEG to ICO too?', a: 'Yes. JPG and JPEG are two filename extensions for the same image format. Both can be used as source images here; a separate JPEG-to-JPG conversion is unnecessary.' },
      { q: 'Will a transparent PNG stay transparent?', a: 'The PNG-backed ICO export retains the rendered image alpha channel. It cannot make an opaque background transparent or restore transparency that was already lost.' },
      { q: 'Can I choose several icon sizes?', a: 'No. The current export stores one image and automatically limits its largest dimension to 256 pixels. There is no size selector or multi-resolution bundle control.' },
      { q: 'Are the images sent to a conversion server?', a: 'This image conversion runs in browser memory. The website still loads its application resources; keep the page open until conversion and download have finished.' },
    ],
  },
  'image-converter-images-to-bmp': {
    title: 'PNG & JPG to BMP - 24-bit Bitmap Converter | PDFConverter',
    description: 'Convert PNG, JPG, WebP or SVG images to a real 24-bit BMP file. See how image dimensions, transparency and bitmap compatibility are handled.',
    h1: 'Convert PNG, JPG and other images to 24-bit BMP',
    intro: 'Use this workflow when an application requests a Windows bitmap instead of a PNG or JPEG. The exporter writes an uncompressed 24-bit BMP containing the rendered image pixels. It is not a palette or monochrome bitmap generator.',
    widget: 'images', initialFormat: 'BMP',
    facts: [{ label: 'Inputs for this workflow', value: 'PNG, JPG, WebP, SVG' }, { label: 'Output', value: '24-bit BMP' }, { label: 'Background', value: 'White behind transparent areas' }, { label: 'Dimensions', value: 'Rendered source dimensions' }],
    steps: [
      { title: 'Check the receiving application', text: 'Confirm that it accepts a 24-bit BMP. Software asking for an indexed 8-bit bitmap, a 1-bit image or an exact pixel size has additional requirements this tool cannot configure.' },
      { title: 'Add the source artwork', text: 'BMP is selected below. Choose PNG, JPG, WebP or a self-contained SVG. Use a source with the dimensions you need because this workspace does not provide a resize control.' },
      { title: 'Convert to BMP', text: 'Choose Convert All to BMP. Each image is rendered with white behind any transparent pixels, then written to its own bitmap file.' },
      { title: 'Download and open the result', text: 'Save the .bmp file and test it in your target application. For several different source images, use individual downloads or the ZIP option after conversion.' },
    ],
    sections: [
      { heading: 'What happens to transparent PNG and WebP areas?', paragraphs: ['The 24-bit BMP output has red, green and blue channels without an alpha channel. Transparent and partly transparent source pixels are composited over white. An image that relies on a transparent background may therefore look different after export.', 'If your destination accepts PNG, use PNG when you need to retain transparency. Changing a file extension from .png to .bmp will not perform this conversion.'] },
      { heading: 'Why the BMP may be much larger', paragraphs: ['An uncompressed bitmap stores pixel rows without PNG or JPEG compression. Its size grows with image width and height, including row padding. A larger BMP does not recover detail discarded by an earlier JPEG save.', 'SVG input is rasterized at its rendered dimensions. The resulting BMP no longer contains editable vector paths, and it will not remain sharp at every possible enlargement. Keep the SVG original if you need scalable artwork.'] },
    ],
    faqs: [
      { q: 'Can I convert PNG to BMP online?', a: 'Yes. Select BMP, add your PNG and convert it. The downloaded result is a 24-bit bitmap; it is not an indexed 8-bit or monochrome BMP.' },
      { q: 'Does JPG to BMP improve image quality?', a: 'No. It changes the storage format. JPEG compression artifacts and missing detail remain in the rendered pixels.' },
      { q: 'Can I choose a different background color?', a: 'No. This BMP exporter uses white behind transparent areas. The current interface does not offer a background-color selector.' },
      { q: 'Can WebP or SVG be converted to BMP?', a: 'Yes, for browser-decodable static WebP and self-contained SVG input. SVG becomes a raster image. This workflow does not preserve animation or vector editing.' },
      { q: 'Will it meet a device’s exact bitmap specification?', a: 'Only if that specification matches this output. Check the required dimensions, 24-bit color support and file-size allowance before using the result on a device.' },
    ],
  },
  'image-converter-bmp-to-png': {
    title: 'BMP to PNG Converter - Export Bitmap Images | PDFConverter',
    description: 'Convert a BMP image to PNG in your browser, keep its rendered dimensions and download files individually or in a ZIP. No JPEG conversion is needed.',
    h1: 'Convert BMP images to PNG',
    intro: 'Make a PNG copy of a browser-readable BMP when you need a more convenient image format for sharing or uploading. This workflow keeps the rendered pixel dimensions and avoids an intermediate JPEG save.',
    widget: 'images', initialFormat: 'PNG',
    facts: [{ label: 'Source', value: 'Browser-readable BMP' }, { label: 'Destination', value: 'PNG image' }, { label: 'Dimensions', value: 'Kept from decoded image' }, { label: 'Multiple inputs', value: 'Separate PNGs or ZIP' }],
    steps: [
      { title: 'Select PNG output', text: 'PNG is selected below. Keep this target if you want a PNG result rather than a JPEG with a changed extension.' },
      { title: 'Choose your bitmap files', text: 'Add one or more .bmp files. The browser must be able to decode the particular BMP variant; an unusual, damaged or unsupported file can fail even when its extension is correct.' },
      { title: 'Convert the image queue', text: 'Choose Convert All to PNG and wait for the completed status beside each file. The conversion draws the decoded bitmap pixels into the PNG output.' },
      { title: 'Save the PNG copies', text: 'Download individual images or completed results as a ZIP. Keep unique file basenames when using the archive, because the ZIP uses each source basename with a .png extension.' },
    ],
    sections: [
      { heading: 'What is retained, and what is not?', paragraphs: ['The PNG records the decoded image appearance at the rendered source dimensions. It is a new raster export, not a byte-for-byte copy of the BMP container. Do not rely on it to preserve application-specific BMP metadata or an indexed color palette.', 'PNG supports alpha transparency, but converting an ordinary opaque bitmap does not remove its background. If your original image is already flattened on white, the white pixels remain.'] },
      { heading: 'File size and compatibility', paragraphs: ['PNG compression often makes an uncompressed bitmap easier to store or share, but the actual result depends on the image. There is no target-file-size setting and no guarantee that every output will be smaller.', 'If the BMP fails to load, first check whether another image viewer can open it. A renamed file or an uncommon bitmap encoding may not be readable by the browser. Export a standard BMP from the source application when possible.'] },
    ],
    faqs: [
      { q: 'How do I change a BMP to PNG?', a: 'Select PNG, add the BMP, choose Convert All to PNG and download the completed image. The tool writes PNG bytes rather than only changing the filename.' },
      { q: 'Does this reduce the image dimensions?', a: 'No resize step is applied in this workflow. The PNG uses the dimensions of the image decoded by the browser.' },
      { q: 'Is it better to convert BMP to JPG first?', a: 'That extra step is unnecessary when you want PNG. JPEG encoding can introduce additional artifacts, so convert directly from the bitmap source.' },
      { q: 'Can I process several bitmap files?', a: 'Yes. Each queued bitmap becomes a separate PNG. The ZIP option collects completed files; it does not combine them into one image.' },
      { q: 'Why does my converted PNG still have a background?', a: 'Format conversion does not identify or remove background pixels. An opaque background in the source remains part of the image.' },
    ],
  },
  'image-converter-svg-to-webp': {
    title: 'SVG to WebP Converter - Rasterize SVG Artwork | PDFConverter',
    description: 'Render a self-contained SVG as a static WebP image in your browser. Understand output dimensions, transparency and the loss of vector editability.',
    h1: 'Convert SVG artwork to a static WebP image',
    intro: 'Create a raster copy when your destination accepts WebP but cannot use the original SVG. The conversion renders the SVG into pixels and encodes those pixels as WebP. Your original vector file remains the best source for later edits or different export sizes.',
    widget: 'images', initialFormat: 'WEBP',
    facts: [{ label: 'Input', value: 'Self-contained SVG' }, { label: 'Output', value: 'Static WebP image' }, { label: 'Vector paths', value: 'Rasterized into pixels' }, { label: 'Sizing', value: 'From rendered SVG dimensions' }],
    steps: [
      { title: 'Prepare a self-contained SVG', text: 'Use an SVG with explicit width and height where possible. Keep required artwork inside the file. References to external images or fonts can affect rendering or prevent export.' },
      { title: 'Choose WebP and add the file', text: 'WebP is preselected below. Add the SVG to the queue and review the displayed preview before converting.' },
      { title: 'Render and encode', text: 'Choose Convert All to WebP. The existing image converter rasterizes the artwork and uses its fixed WebP encoding setting; there is no quality slider or vector-preservation option.' },
      { title: 'Inspect the downloaded image', text: 'Check text, thin lines, transparency and the pixel dimensions in your destination. If you need another size, prepare the SVG at the desired dimensions before exporting again.' },
    ],
    sections: [
      { heading: 'SVG and WebP solve different problems', paragraphs: ['SVG describes vector artwork. WebP stores raster image data. A WebP copy cannot retain editable SVG paths or scale without a pixel limit. Conversion is useful for compatibility, not a replacement for keeping the vector original.', 'The current exporter uses lossy WebP encoding at a fixed quality setting. Do not treat this as a lossless archive of a logo or assume a fixed reduction in file size. Inspect edges and small lettering after download.'] },
      { heading: 'Transparent and animated artwork', paragraphs: ['The WebP output can retain the alpha channel of the rendered SVG. The tool does not automatically remove an existing background or offer a choice of background colors.', 'This workflow produces a static image. It does not preserve SVG animation, interactivity, scripts or links. For animated or externally styled artwork, use the source application to create the particular static frame you need first.'] },
    ],
    faqs: [
      { q: 'Can I convert SVG to WebP without installing software?', a: 'Yes. Add a self-contained SVG and select WebP in the browser workspace. Successful rendering depends on the SVG and resources your browser can load.' },
      { q: 'Will my WebP still be a vector image?', a: 'No. The SVG is rasterized. Keep the original SVG if you need vector editing or another export size.' },
      { q: 'Can I choose output width, height or quality here?', a: 'No. This interface uses the rendered source dimensions and a fixed WebP quality setting. Prepare the source dimensions before upload if a specific size is required.' },
      { q: 'Why are a font or linked picture missing?', a: 'External resources may be unavailable or restricted during browser rendering. Use a self-contained SVG and check its preview; format conversion cannot supply missing assets.' },
      { q: 'Should I use PNG instead?', a: 'PNG is a useful alternative when you want lossless storage of the rendered pixels. It is still a raster image and does not retain SVG paths. Use the related SVG-to-PNG tool if that output better fits your destination.' },
    ],
  },
  'image-converter-batch-webp-conversion': {
    title: 'Batch WebP to PNG or JPG - Download a ZIP | PDFConverter',
    description: 'Convert multiple static WebP images to PNG or JPG in one queue. Keep alpha with PNG, use a white background with JPG, and download a ZIP of completed files.',
    h1: 'Batch convert WebP images to PNG or JPG',
    intro: 'Process a group of static WebP images without repeating a single-file conversion for each one. Choose PNG for transparency or JPG for an opaque photo format, add the images to one queue, and collect the completed outputs.',
    widget: 'images', initialFormat: 'PNG',
    facts: [{ label: 'Source images', value: 'Static WebP files' }, { label: 'Default output', value: 'PNG; JPG also available' }, { label: 'File handling', value: 'One output per source' }, { label: 'Download', value: 'Individual files or ZIP' }],
    steps: [
      { title: 'Choose PNG or JPG before adding files', text: 'PNG is selected initially and can preserve existing alpha transparency. Select JPG if your destination needs JPEG images; transparent areas will be placed over white.' },
      { title: 'Add the WebP batch', text: 'Choose several files together or drop them into the queue. Use distinct source basenames if you intend to download a ZIP, since the archive filenames are based on those names.' },
      { title: 'Convert and check each status', text: 'Choose Convert All to the selected format. Each source is converted separately. Review the queue for errors instead of assuming that every file completed successfully.' },
      { title: 'Download the completed images', text: 'Use the per-file Download buttons or Download All as .ZIP. The archive contains completed outputs only. Extract it before opening the resulting PNG or JPG files in another application.' },
    ],
    sections: [
      { heading: 'Bulk WebP-to-PNG versus WebP-to-JPG', paragraphs: ['PNG retains the rendered alpha channel and avoids adding another lossy image encoding stage. It cannot recover detail already lost in a lossy WebP source. A PNG result can be larger than the original WebP.', 'JPG is opaque and uses lossy encoding. It can suit photo upload forms that accept JPEG but not WebP. Check the white background around transparent artwork and inspect small text after conversion.'] },
      { heading: 'Queue and archive limits to understand', paragraphs: ['Changing the target format updates files that are still ready to convert. Already completed files keep their existing outputs. For a uniform batch, choose the output before uploading or clear the queue and start again.', 'Files sharing the same basename can overwrite an archive entry after their extensions change. Rename them before creating a ZIP. If archive creation is unavailable, the tool attempts individual downloads instead; your browser may require permission for multiple downloads.', 'Large batches consume browser memory. Start with a manageable group and keep the tab open until downloads finish. This workflow does not retain animated WebP frames, resize images, or promise a particular final file size.'] },
    ],
    faqs: [
      { q: 'Can I convert WebP to PNG in bulk?', a: 'Yes. Select PNG, add multiple static WebP files and use Convert All to PNG. Download each completed PNG or collect them in a ZIP.' },
      { q: 'Can the same queue export JPG instead?', a: 'Yes. Select JPG before adding the batch. The converter uses a white background behind transparent pixels. Files already converted are not changed when you select another target.' },
      { q: 'Does the ZIP combine the images into one picture?', a: 'No. A ZIP is an archive containing separate image files. Extract it to access the individual outputs.' },
      { q: 'What if one image fails?', a: 'Check the error shown beside that file. Completed images remain downloadable. Unsupported, damaged or animated inputs may need a different source file or workflow.' },
      { q: 'Will all original filenames be kept?', a: 'The source basename is used with the new output extension. Use unique basenames when downloading a ZIP so two outputs do not compete for the same archive filename.' },
    ],
  },
  'image-converter-image-format-comparison': {
    title: 'PNG vs JPG vs WebP - Choose an Image Format | PDFConverter',
    description: 'Choose PNG, JPG or WebP for transparency, photographs and compatibility. Compare the formats and understand the actual output settings before converting.',
    h1: 'PNG vs JPG vs WebP: which output should you choose?',
    intro: 'Choose a format for the job the image must do. A transparent graphic, a photo upload and a web illustration have different requirements. Use the comparison below before converting; a new filename extension cannot restore missing detail or remove a background.',
    widget: 'images', initialFormat: 'PNG',
    facts: [{ label: 'Transparent graphics', value: 'PNG or WebP' }, { label: 'Opaque photo uploads', value: 'JPG when required' }, { label: 'Rendered pixel archive', value: 'PNG is lossless' }, { label: 'Always check', value: 'Destination format rules' }],
    comparison: [
      { format: 'PNG', usefulFor: 'Screenshots, diagrams and rendered artwork where pixel fidelity matters', transparency: 'Alpha transparency supported', output: 'Lossless PNG encoding of the rendered pixels' },
      { format: 'JPG / JPEG', usefulFor: 'Photographs and destinations that specifically request JPEG', transparency: 'None; this converter fills transparent areas with white', output: 'Lossy JPEG encoding with the existing fixed quality setting' },
      { format: 'WebP', usefulFor: 'Static web images when the receiving system accepts WebP', transparency: 'Alpha transparency supported', output: 'This converter uses fixed-quality lossy WebP, not lossless WebP' },
    ],
    steps: [
      { title: 'Read the destination requirements', text: 'Check the accepted extensions, transparency needs and upload limits. If the destination insists on JPG, a smaller WebP is not a suitable substitute.' },
      { title: 'Pick the output format below', text: 'Choose PNG for a lossless raster export, JPG for an opaque JPEG, or WebP when its format support and encoding tradeoffs suit the destination.' },
      { title: 'Convert a representative source', text: 'Start with one image containing the details you care about, such as small lettering, gradients or transparent edges. Compare the downloaded image at normal viewing size.' },
      { title: 'Then process the remaining files', text: 'Keep the best available originals and use the chosen output for the rest of the batch. Check file sizes afterward; this workspace does not offer a target-size or quality-slider control.' },
    ],
    sections: [
      { heading: 'Is PNG or WebP better?', paragraphs: ['Neither is the right answer for every image. PNG provides lossless storage of the rendered pixels and broad support for diagrams and screenshots. WebP supports efficient image compression and transparency, but your destination must accept it.', 'The WebP format supports more than one encoding mode. This particular tool uses lossy WebP at a fixed setting. Choosing WebP here is not a request for a lossless WebP export, and converting an image repeatedly can introduce additional changes.'] },
      { heading: 'WebP versus JPEG for photographs', paragraphs: ['Both are useful photo formats, but encoding settings and the source image affect the result. Do not assume a fixed percentage reduction or that one output will always be smaller. Inspect skin tones, gradients and fine texture in your own file.', 'JPEG does not store alpha transparency. If you convert a transparent PNG or WebP to JPG here, white is placed behind the transparent pixels. Returning that JPG to PNG later does not bring the alpha channel back.'] },
    ],
    faqs: [
      { q: 'Does WebP support transparency?', a: 'Yes. WebP can store an alpha channel, and the browser export can retain the alpha of a rendered source. It does not remove opaque backgrounds.' },
      { q: 'Why use WebP instead of PNG?', a: 'It can be a useful web-delivery format when the receiving system supports it. Compare a representative output rather than assuming a size saving, especially because this tool uses lossy WebP encoding.' },
      { q: 'Are JPG and JPEG different formats?', a: 'No. They are common extensions for the same image format. Changing between those names alone is not a useful image conversion.' },
      { q: 'Can PNG make a blurry JPEG sharp again?', a: 'No. PNG avoids another lossy encoding step, but it cannot recover image detail already discarded by JPEG or another earlier conversion.' },
      { q: 'Can I export animated WebP with this tool?', a: 'No animation-preserving workflow is provided here. Use static images for this comparison and conversion process.' },
    ],
  },
  'rotate-pdf-save-rotation': {
    title: 'Rotate a PDF and Save Its Orientation | PDFConverter',
    description: 'Save PDF page orientation instead of only turning the viewer. This tool rotates every page 90 degrees clockwise and downloads a new PDF, up to 25 MB.',
    h1: 'Rotate a PDF and save the new page orientation',
    intro: 'A PDF viewer can temporarily turn a document without saving that view to a new file. This workflow writes updated page rotation into a downloadable PDF. The current tool turns every page 90 degrees clockwise; it does not offer individual-page or angle controls.',
    widget: 'converter',
    facts: [{ label: 'Input', value: 'One PDF, up to 25 MB' }, { label: 'Rotation', value: '90° clockwise' }, { label: 'Affected pages', value: 'Every page' }, { label: 'Output', value: 'New downloadable PDF' }],
    steps: [
      { title: 'Check whether every page needs the same turn', text: 'Open the original and inspect its orientation. This tool suits a document whose pages all need a 90-degree clockwise adjustment. Mixed-orientation files may need selective controls that are not available here.' },
      { title: 'Choose the original PDF', text: 'Add a non-empty .pdf file no larger than 25 MB. Keep the source as a separate copy so you can compare the saved result.' },
      { title: 'Run the rotation', text: 'Choose Convert to PDF Now. The operation adds 90 degrees to each page’s existing rotation and creates a new PDF. It does not rotate only the visible page in a preview.' },
      { title: 'Download, reopen and verify', text: 'Choose Download File, then open that downloaded PDF in a viewer. Check several pages and use the new file for later sharing or printing. Closing a viewer without downloading the result does not save this output.' },
    ],
    sections: [
      { heading: 'Saved orientation versus a temporary viewer rotation', paragraphs: ['Viewer controls can change only how a PDF is displayed during the current session. The exported file from this tool records page rotation in the PDF, so a reader that honors that orientation can display the saved result correctly.', 'This changes page rotation metadata; it is not OCR, a scan repair operation or an image editor. It does not make photographed text searchable or straighten a slightly skewed scan.'] },
      { heading: 'When this workflow is not the right fit', paragraphs: ['Do not use it when just one page needs turning, when you need to choose a counterclockwise turn, or when individual pages need different angles. The existing interface has no page selector or angle selector.', 'If an upload fails, check the file size and whether the PDF is valid and readable. Password-protected or damaged PDFs may not load. This page does not unlock protection or bypass document restrictions.'] },
    ],
    faqs: [
      { q: 'How do I rotate a PDF file and save it?', a: 'Choose the original PDF, run the conversion, download the new PDF and reopen that downloaded file. The current operation turns every page 90 degrees clockwise.' },
      { q: 'Is the rotation saved permanently?', a: 'The downloaded PDF contains the updated page rotation. Keep and share that new file rather than the original. A later PDF editor can still change its rotation again.' },
      { q: 'Can I rotate just one page?', a: 'No. This interface applies the same turn to every page and has no individual-page control. Use a tool with page selection if your document needs mixed orientations.' },
      { q: 'Can I select 180 degrees or a counterclockwise turn?', a: 'No. Although other tools may offer those choices, this widget currently performs one 90-degree clockwise turn per conversion.' },
      { q: 'Why does my original still look unchanged?', a: 'A new file is created; your source is not overwritten. Find and open the downloaded converted PDF, and check that you are not reopening the original.' },
    ],
  },
};

export function getEnglishIntentPage(slug: string) {
  const index = findEnglishIntent(slug);
  return index ? { ...index, ...CONTENT[index.slug] } : null;
}
export type EnglishIntentPage = NonNullable<ReturnType<typeof getEnglishIntentPage>>;

import { SUPPORTED_LOCALES, type Locale } from './i18n-registry';
import { getPseoToolCapability } from './pseo-publication';
import { toolCopy } from './tool-content-copy';
import type { ToolDefinition, PseoModifier } from './tools-registry';

const copy = {
  formats: ['Input: {input}. Output: {output}.', 'Entrée : {input}. Sortie : {output}.', 'Entrada: {input}. Salida: {output}.', 'Eingabe: {input}. Ausgabe: {output}.', 'الإدخال: {input}. الإخراج: {output}.'],
  local: ['The conversion runs in the browser. Keep the page open until the download is ready.', 'La conversion se fait dans le navigateur. Gardez la page ouverte jusqu’au téléchargement.', 'La conversión se ejecuta en el navegador. Mantén abierta la página hasta que la descarga esté lista.', 'Die Konvertierung läuft im Browser. Lassen Sie die Seite bis zum Download geöffnet.', 'يتم التحويل في المتصفح. اترك الصفحة مفتوحة حتى يصبح التنزيل جاهزًا.'],
  conditional: ['This conversion runs in the browser if it can decode the input and encode the output. Support varies by browser.', 'La conversion se fait dans le navigateur s’il peut lire le format source et produire le format de sortie. La prise en charge varie selon le navigateur.', 'La conversión se ejecuta en el navegador si puede leer el formato de entrada y generar el de salida. La compatibilidad varía según el navegador.', 'Die Konvertierung läuft im Browser, sofern er das Eingabeformat lesen und das Ausgabeformat erzeugen kann. Die Unterstützung hängt vom Browser ab.', 'يتم التحويل في المتصفح إذا كان يدعم قراءة صيغة الإدخال وكتابة صيغة الإخراج. يختلف الدعم حسب المتصفح.'],
  server: ['The page uploads the selected file to a conversion service. An available service is required, and the hosting platform may impose a lower upload limit.', 'La page envoie le fichier sélectionné à un service de conversion. Ce service doit être disponible et l’hébergeur peut imposer une limite d’envoi inférieure.', 'La página envía el archivo seleccionado a un servicio de conversión. El servicio debe estar disponible y el alojamiento puede imponer un límite de subida menor.', 'Die Seite lädt die ausgewählte Datei zu einem Konvertierungsdienst hoch. Der Dienst muss verfügbar sein. Das Hosting kann eine niedrigere Uploadgrenze vorgeben.', 'ترفع الصفحة الملف المحدد إلى خدمة تحويل. يجب أن تكون الخدمة متاحة، وقد يفرض مزود الاستضافة حدًا أقل لحجم الرفع.'],
  limit: ['Up to 25 MB per input file', 'Jusqu’à 25 Mo par fichier source', 'Hasta 25 MB por archivo de entrada', 'Bis zu 25 MB pro Eingabedatei', 'حتى 25 ميغابايت لكل ملف إدخال'],
  dimensions: ['The input image must fit within 40 megapixels.', 'L’image source ne doit pas dépasser 40 mégapixels.', 'La imagen de entrada no debe superar los 40 megapíxeles.', 'Das Eingabebild darf höchstens 40 Megapixel groß sein.', 'يجب ألا تتجاوز صورة الإدخال 40 ميغابكسل.'],
  result: ['What should I expect from the result?', 'À quoi dois-je m’attendre dans le résultat ?', '¿Qué puedo esperar del resultado?', 'Was kann ich von der Ausgabe erwarten?', 'ماذا أتوقع من النتيجة؟'],
  processing: ['Where is my file processed?', 'Où mon fichier est-il traité ?', '¿Dónde se procesa mi archivo?', 'Wo wird meine Datei verarbeitet?', 'أين تتم معالجة الملف؟'],
  input: ['Input format', 'Format source', 'Formato de entrada', 'Eingabeformat', 'صيغة الإدخال'],
  output: ['Output format', 'Format de sortie', 'Formato de salida', 'Ausgabeformat', 'صيغة الإخراج'],
  size: ['Input limit', 'Limite par fichier', 'Límite por archivo', 'Dateigrößenlimit', 'حد حجم الملف'],
  mac: ['Where do I find the download on Mac?', 'Où retrouver le téléchargement sur Mac ?', '¿Dónde encuentro la descarga en Mac?', 'Wo finde ich den Download auf dem Mac?', 'أين أجد الملف المنزّل على ماك؟'],
  macTip: ['Choose a file from Finder using the browser file picker. After conversion, use the browser’s download list to locate the saved result.', 'Choisissez un fichier du Finder dans le sélecteur du navigateur. Après la conversion, retrouvez le résultat dans la liste des téléchargements.', 'Elige un archivo del Finder con el selector del navegador. Tras convertirlo, búscalo en la lista de descargas.', 'Wählen Sie im Dateidialog eine Datei aus dem Finder. Nach der Konvertierung finden Sie die Ausgabe in der Downloadliste des Browsers.', 'اختر ملفًا من فايندر باستخدام أداة اختيار الملفات في المتصفح. بعد التحويل، ابحث عن الناتج في قائمة التنزيلات.'],
  windows: ['Where do I find the download on Windows?', 'Où retrouver le téléchargement sur Windows ?', '¿Dónde encuentro la descarga en Windows?', 'Wo finde ich den Download unter Windows?', 'أين أجد الملف المنزّل على ويندوز؟'],
  windowsTip: ['Select a file with the browser file picker. Check the browser’s download list or the folder selected in its download settings.', 'Sélectionnez un fichier dans le navigateur. Consultez la liste des téléchargements ou le dossier choisi dans ses paramètres.', 'Selecciona un archivo con el selector del navegador. Consulta la lista de descargas o la carpeta indicada en su configuración.', 'Wählen Sie eine Datei im Browser aus. Prüfen Sie die Downloadliste oder den in den Einstellungen gewählten Ordner.', 'حدد ملفًا باستخدام أداة اختيار الملفات في المتصفح. راجع قائمة التنزيلات أو المجلد المحدد في إعداداتها.'],
  iphone: ['How do I choose and save a file on iPhone?', 'Comment choisir et enregistrer un fichier sur iPhone ?', '¿Cómo elijo y guardo un archivo en iPhone?', 'Wie wähle und speichere ich eine Datei auf dem iPhone?', 'كيف أختار الملف وأحفظه على آيفون؟'],
  iphoneTip: ['Choose a supported file from Files or an available storage location. If you select a photo, check its actual format. Locate the result using your browser’s download controls.', 'Choisissez un fichier compatible dans Fichiers ou un emplacement disponible. Pour une photo, vérifiez son format réel. Retrouvez le résultat via les téléchargements du navigateur.', 'Elige un archivo compatible en Archivos o en una ubicación disponible. Si eliges una foto, comprueba su formato real. Busca el resultado en las descargas del navegador.', 'Wählen Sie in „Dateien“ oder an einem verfügbaren Speicherort eine unterstützte Datei. Prüfen Sie bei Fotos das tatsächliche Format. Nutzen Sie die Downloadliste des Browsers.', 'اختر ملفًا مدعومًا من تطبيق «الملفات» أو من موقع تخزين متاح. عند اختيار صورة، تحقق من صيغتها الفعلية. ابحث عن الناتج في تنزيلات المتصفح.'],
  watermark: ['Can I remove a watermark with this tool?', 'Cet outil peut-il supprimer un filigrane ?', '¿Esta herramienta elimina marcas de agua?', 'Kann ich damit ein Wasserzeichen entfernen?', 'هل يمكن إزالة علامة مائية بهذه الأداة؟'],
  watermarkTip: ['This page has no watermark-removal control. If the source already contains a mark, inspect the downloaded result before using it.', 'Cette page ne propose pas de fonction de suppression de filigrane. Si le fichier source contient déjà une marque, vérifiez le résultat téléchargé.', 'Esta página no tiene un control para quitar marcas de agua. Si el original ya tiene una marca, revisa el resultado descargado.', 'Diese Seite bietet keine Funktion zum Entfernen von Wasserzeichen. Wenn die Quelle bereits ein Wasserzeichen enthält, prüfen Sie den Download.', 'لا توفر الصفحة خيارًا لإزالة العلامات المائية. إذا احتوى الأصل على علامة، افحص الملف المنزّل قبل استخدامه.'],
  viewer: ['The preview runs in your browser. Some formats load supporting libraries.', 'L’aperçu s’exécute dans le navigateur. Certains formats chargent des bibliothèques supplémentaires.', 'La vista previa se ejecuta en el navegador. Algunos formatos cargan bibliotecas adicionales.', 'Die Vorschau läuft im Browser. Für manche Formate werden weitere Bibliotheken geladen.', 'تعمل المعاينة في المتصفح. تتطلب بعض الصيغ تحميل مكتبات مساندة.'],
  markdown: ['Editing and .md export run in the browser.', 'La saisie et l’export en .md se font dans le navigateur.', 'La edición y la exportación a .md se ejecutan en el navegador.', 'Bearbeitung und .md-Export laufen im Browser.', 'يتم التحرير والتصدير بصيغة .md في المتصفح.'],
} as const;

const resultQuestions: Partial<Record<keyof typeof toolCopy, readonly string[]>> = {
  merge: ['How many PDFs can I merge at once?', 'Combien de PDF puis-je fusionner à la fois ?', '¿Cuántos PDF puedo unir a la vez?', 'Wie viele PDFs kann ich gleichzeitig zusammenführen?', 'كم ملف PDF يمكنني دمجه دفعة واحدة؟'],
  split: ['Can I split out a range of pages?', 'Puis-je extraire une plage de pages ?', '¿Puedo extraer un intervalo de páginas?', 'Kann ich einen Seitenbereich extrahieren?', 'هل يمكنني استخراج نطاق من الصفحات؟'],
  rotate: ['Can I rotate one page or choose an angle?', 'Puis-je choisir une page ou un angle ?', '¿Puedo girar una sola página o elegir un ángulo?', 'Kann ich eine Seite oder einen Winkel auswählen?', 'هل يمكنني تدوير صفحة واحدة أو اختيار الزاوية؟'],
  pdfText: ['Can I extract text from a scanned PDF?', 'Puis-je extraire le texte d’un PDF numérisé ?', '¿Puedo extraer texto de un PDF escaneado?', 'Kann ich Text aus einem gescannten PDF extrahieren?', 'هل يمكن استخراج النص من ملف PDF ممسوح ضوئيًا؟'],
  pdfImage: ['What do I download from a multipage PDF?', 'Que vais-je télécharger pour un PDF de plusieurs pages ?', '¿Qué se descarga al convertir un PDF de varias páginas?', 'Was erhalte ich bei einem mehrseitigen PDF?', 'ما الذي أنزّله عند تحويل ملف PDF متعدد الصفحات؟'],
  imagePdf: ['How many pages does the PDF contain?', 'Combien de pages contient le PDF ?', '¿Cuántas páginas contiene el PDF?', 'Wie viele Seiten enthält das PDF?', 'كم صفحة يحتوي عليها ملف PDF الناتج؟'],
  csv: ['What happens to a workbook with multiple sheets?', 'Que devient un classeur de plusieurs feuilles ?', '¿Qué ocurre con un libro que tiene varias hojas?', 'Was passiert mit einer Arbeitsmappe mit mehreren Blättern?', 'ما ناتج تحويل مصنف يحتوي على عدة أوراق؟'],
  compress: ['What should I check after compression?', 'Que vérifier après la compression ?', '¿Qué debo comprobar después de comprimir?', 'Was sollte ich nach der Komprimierung prüfen?', 'ماذا أراجع بعد الضغط؟'],
  protect: ['Can I enter a password on this page?', 'Puis-je saisir un mot de passe sur cette page ?', '¿Puedo introducir una contraseña en esta página?', 'Kann ich auf dieser Seite ein Passwort eingeben?', 'هل يمكنني إدخال كلمة مرور في هذه الصفحة؟'],
  pdfa: ['How do I check the PDF/A profile?', 'Comment vérifier le profil PDF/A ?', '¿Cómo compruebo el perfil PDF/A?', 'Wie prüfe ich das PDF/A-Profil?', 'كيف أتحقق من مستوى PDF/A؟'],
};

const englishCoreFaqs: Record<string, { q: string; a: string }[]> = {
  'pdf-to-jpg': [
    { q: 'What happens when a PDF has multiple pages?', a: 'Every page is rendered as a separate JPG. A one-page PDF downloads as one image; a multi-page PDF downloads as a ZIP containing one JPG per page.' },
    { q: 'Can I convert only selected PDF pages?', a: 'No. The current converter renders all pages and does not provide a page-range selector.' },
    { q: 'What are the PDF to JPG limits?', a: 'Each PDF must be 25 MB or smaller. Rendering also stops if the combined page output exceeds 40 megapixels.' },
  ],
  'pdf-to-png': [
    { q: 'How are pages from a multi-page PDF downloaded?', a: 'The converter renders every complete page as a PNG. One page downloads as an image; multiple pages are delivered in a ZIP with one PNG per page.' },
    { q: 'Can I select a page range?', a: 'No. The current tool renders every page in the PDF.' },
    { q: 'What limits apply to PDF to PNG?', a: 'Each input PDF must be 25 MB or smaller, and the combined rendered pages are limited to 40 megapixels.' },
  ],
  'merge-pdf': [
    { q: 'How many PDFs can I merge?', a: 'Choose at least 2 and no more than 20 PDFs. Each input file must be 25 MB or smaller.' },
    { q: 'Can I reorder files after selecting them?', a: 'There is no visual reorder control. The merged PDF follows the file order supplied by the browser, which is not guaranteed to match the order in which you select files.' },
    { q: 'What does the merge download contain?', a: 'The result is one PDF. Pages from each source are copied in the order reported by the browser file list.' },
  ],
  'rotate-pdf': [
    { q: 'What does the Rotate PDF button do?', a: 'The current page rotates every page in the document 90° clockwise and saves a new PDF.' },
    { q: 'Can I rotate one page or choose another angle?', a: 'No. The interface has no page or angle selector; it applies the same 90° clockwise turn to every page.' },
    { q: 'Does rotation change the original PDF?', a: 'The tool downloads a new rotated PDF. Keep the original if you may need to restore its previous orientation.' },
  ],
  'split-pdf': [
    { q: 'What does Split PDF download?', a: 'It downloads a ZIP containing one PDF for every page in the source document.' },
    { q: 'Can I extract only a page range?', a: 'No. The current interface splits every page and has no page-range or selected-page control.' },
    { q: 'What is the input limit for splitting a PDF?', a: 'The PDF must be 25 MB or smaller. Keep the browser tab open while the page PDFs are packaged into the ZIP.' },
  ],
};

type Detail = keyof typeof toolCopy;
const details: Partial<Record<string, readonly Detail[]>> = {
  'merge-pdf': ['merge'], 'split-pdf': ['split'], 'rotate-pdf': ['rotate'],
  'pdf-to-txt': ['pdfText', 'pdfPlain'], 'pdf-to-markdown': ['pdfText', 'pdfMarkdown'],
  'pdf-to-json': ['pdfText', 'pdfJson'], 'pdf-to-xml': ['pdfText', 'pdfXml'],
  'pdf-to-html': ['pdfText', 'pdfHtml'], 'pdf-to-long-image': ['longImage'], 'pdf-to-base64': ['base64'],
  'docx-to-txt': ['docxText'], 'docx-to-html': ['docxHtml'], 'xlsx-to-csv': ['csv'],
  'pdf-to-word': ['pdfOffice'], 'pdf-to-excel': ['pdfOffice'], 'pdf-to-ppt': ['pdfOffice'],
  'pdf-to-csv': ['pdfOffice'], 'pdf-to-rtf': ['pdfOffice'], 'pdf-to-latex': ['pdfOffice'],
  'word-to-pdf': ['officePdf'], 'doc-to-pdf': ['officePdf'], 'ppt-to-pdf': ['officePdf'],
  'excel-to-pdf': ['officePdf'], 'odt-to-pdf': ['officePdf'], 'ods-to-pdf': ['officePdf'], 'odp-to-pdf': ['officePdf'],
  'compress-pdf': ['compress'], 'protect-pdf': ['protect'], 'unlock-pdf': ['protect'],
  'pdf-to-scanned-document': ['scan'], 'pdf-to-pdfa': ['pdfa'],
  'image-converter': ['imageUtility'], 'view-documents-online': ['viewer'], 'markdown-editor': ['markdown'],
};
const platforms = {
  'for-mac': ['mac', 'macTip'],
  'for-windows': ['windows', 'windowsTip'],
  'on-iphone': ['iphone', 'iphoneTip'],
  'without-watermark': ['watermark', 'watermarkTip'],
} as const;

export function getToolContent(tool: ToolDefinition, locale: Locale, modifier?: PseoModifier) {
  const index = SUPPORTED_LOCALES.indexOf(locale);
  const input = tool.inputFormat.join(', ');
  const output = tool.outputFormat.toUpperCase();
  const fill = (value: string) => value.replaceAll('{input}', input).replaceAll('{output}', output);
  const capability = getPseoToolCapability(tool.slug);
  const worker = capability === 'external-service-not-verified' && tool.category !== 'utility';
  const rasterInput = tool.category === 'image' || tool.category === 'convert-to-pdf';
  const toolDetails = details[tool.slug] ??
    (worker ? ['service'] : tool.category === 'image' ? ['image'] : tool.category === 'pdf-to' ? ['pdfImage'] : ['imagePdf']);
  const result = toolDetails.map(key => fill(toolCopy[key][index])).join(' ');
  const usesWhite = tool.category === 'image' && !worker && ['JPG', 'BMP'].includes(output);
  const outcome = result + (usesWhite ? ' ' + toolCopy.white[index] : '') +
    (rasterInput && !worker ? ' ' + copy.dimensions[index] : '');
  const processingKey = tool.slug === 'view-documents-online' ? 'viewer' : tool.slug === 'markdown-editor' ? 'markdown'
    : worker ? 'server' : capability === 'browser-dependent' ? 'conditional' : 'local';
  const processing = copy[processingKey][index];
  const faqs = [
    { q: (resultQuestions[toolDetails[0]] ?? copy.result)[index], a: outcome },
    { q: copy.processing[index], a: processing },
    ...(locale === 'en' && !modifier ? englishCoreFaqs[tool.slug] ?? [] : []),
  ];
  if (modifier) {
    const [question, answer] = platforms[modifier];
    faqs.push({ q: copy[question][index], a: copy[answer][index] });
  }
  return {
    description: tool.category === 'utility' ? outcome : fill(copy.formats[index]) + ' ' + outcome + (worker ? ' ' + processing : ''),
    formats: fill(copy.formats[index]),
    faqs,
    specs: [
      { label: copy.input[index], value: input },
      { label: copy.output[index], value: output },
      { label: copy.size[index], value: copy.limit[index] },
    ],
  };
}

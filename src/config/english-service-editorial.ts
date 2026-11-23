// Reviewed against the current upload widget and proxy. Backend availability is conditional.
export const ENGLISH_SERVICE_EDITORIAL = {
  "pdf-to-word": {
    "title": "PDF to Word Converter — Request Editable DOCX | PDFConverter",
    "h1": "Convert a PDF to a Word document",
    "description": "Need to edit a PDF in Word? Submit a PDF to request a DOCX copy from the configured conversion service, then check the text and layout before editing. Conversion requires an available service that supports PDF to Word.",
    "heading": "How to request a Word copy of your PDF",
    "stepsHeading": "Choose, convert and review",
    "steps": [
      {
        "title": "Choose the source PDF",
        "body": "Select one non-empty .pdf file up to 25 MiB. Use the original document rather than a screenshot. Hosting may impose a lower upload limit."
      },
      {
        "title": "Request DOCX output",
        "body": "Select the conversion button and keep the page open. This operation uploads the PDF to a conversion service. If the service is unavailable or does not support the conversion, the page shows an error."
      },
      {
        "title": "Open the result in Word",
        "body": "If a DOCX is returned, download it and open it in Word or another compatible editor. Compare paragraph order, tables and page breaks with the PDF before making changes."
      }
    ],
    "guidanceHeading": "What to check before using the result",
    "guidance": "PDF pages describe a fixed appearance, while Word documents use editable paragraphs and objects. Check whether the text is editable and whether tables, fonts and images remain useful. OCR and exact layout reproduction are not verified for this operation. Keep the original PDF.",
    "faqs": [
      {
        "q": "Can I edit the converted document in Word?",
        "a": "If the service returns a DOCX, open it in Word and check whether the text can be edited. A DOCX filename alone does not guarantee editable text or a faithful reconstruction."
      },
      {
        "q": "Does PDF to Word work with scanned PDFs?",
        "a": "OCR is not verified for the configured service. A scan can contain only page images. Do not rely on this tool to recognize text in a scanned document."
      },
      {
        "q": "Will the Word document look exactly like the PDF?",
        "a": "Exact formatting is not guaranteed. Compare text order, tables, images and page breaks with the original before using the document."
      },
      {
        "q": "What is the PDF upload limit?",
        "a": "The standard converter accepts one PDF up to 25 MiB. The hosting platform can reject a smaller upload, so an accepted file size does not guarantee conversion."
      },
      {
        "q": "Is my PDF processed in my browser?",
        "a": "This operation sends the selected PDF through the site’s conversion endpoint to a configured conversion service. Browser-only processing and immediate server deletion are not promised."
      }
    ]
  },
  "compress-pdf": {
    "title": "Compress PDF — Check File Size and Readability | PDFConverter",
    "h1": "Reduce PDF file size for sharing",
    "description": "Trying to fit a PDF within an upload or email limit? Request compression through the configured service, then compare the downloaded file’s size and readability with your original. A smaller result depends on the source and service.",
    "heading": "How to request PDF compression",
    "stepsHeading": "Upload, request compression and compare",
    "steps": [
      {
        "title": "Select the original PDF",
        "body": "Choose one non-empty PDF up to 25 MiB. Keep the original so you can compare the result. Hosting may impose a lower upload limit."
      },
      {
        "title": "Request compression",
        "body": "Select the conversion button and keep the page open. The file is sent to a conversion service. This interface has no compression-level or target-size control, and the operation requires backend support."
      },
      {
        "title": "Check the downloaded PDF",
        "body": "If a file is returned, compare its size with the original and open it in a PDF reader. Check small text and images before sharing. Use the original if the output is larger or less readable."
      }
    ],
    "guidanceHeading": "Compression limits",
    "guidance": "An already optimized PDF may have little room for reduction. This page cannot guarantee a percentage reduction or a specific output size. It has no quality slider. Confirm that the configured service supports compression before relying on it for a deadline.",
    "faqs": [
      {
        "q": "Can I compress a PDF to an exact size?",
        "a": "The current interface has no target-size setting. It cannot promise a result under 1 MB, 500 KB or any other threshold."
      },
      {
        "q": "Will compression reduce image quality?",
        "a": "That depends on the service and source PDF. Inspect images and small text in the result. The interface does not offer a quality setting."
      },
      {
        "q": "Why is my PDF not smaller?",
        "a": "Some PDFs are already optimized. A returned PDF may have little size reduction or may be larger. Compare the actual file sizes and keep the original when it is preferable."
      },
      {
        "q": "How large can the input PDF be?",
        "a": "The standard converter accepts one PDF up to 25 MiB. Hosting can impose a lower upload limit."
      },
      {
        "q": "Does compression run locally?",
        "a": "This tool uploads the PDF to a configured conversion service. Compression must be supported by that service, and server-side retention requires confirmation from the operator."
      }
    ]
  }
};

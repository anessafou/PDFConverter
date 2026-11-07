// src/app/view-documents-online/DocumentViewerClient.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ReviewSection from '@/components/reviews/ReviewSection';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

interface LoadedDocument {
  name: string;
  size: number;
  extension: string;
  url: string;
  arrayBuffer: ArrayBuffer;
  textContent?: string;
  lines?: string[];
  excelSheets?: { name: string; data: string[][] }[];
  activeSheetIndex?: number;
  pptxSlides?: { slideNumber: number; title: string; content: string[] }[];
  currentSlideIndex?: number;
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { data: ArrayBuffer; cMapUrl?: string; cMapPacked?: boolean } | string) => {
        promise: Promise<PdfDocumentProxy>;
      };
    };
    docx?: {
      renderAsync: (
        data: ArrayBuffer,
        bodyContainer: HTMLElement,
        styleContainer?: HTMLElement | null,
        options?: Record<string, unknown>
      ) => Promise<unknown>;
    };
    mammoth?: {
      convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    };
    XLSX?: {
      read: (data: ArrayBuffer, opts: { type: string }) => {
        SheetNames: string[];
        Sheets: Record<string, unknown>;
      };
      utils: {
        sheet_to_json: (sheet: unknown, opts: { header: number; defval: string }) => string[][];
      };
    };
    JSZip?: {
      loadAsync: (data: ArrayBuffer) => Promise<{
        files: Record<string, { async: (type: string) => Promise<string> }>;
      }>;
    };
  }
}

interface PdfDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
  destroy: () => void;
}

interface PdfPageProxy {
  getViewport: (params: { scale: number; rotation?: number }) => {
    width: number;
    height: number;
  };
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    transform?: number[] | null;
  }) => {
    promise: Promise<void>;
    cancel: () => void;
  };
}

interface DocumentViewerClientProps {
  initialStats?: AggregateRatingStats | null;
  initialReviews?: Review[];
}

export default function DocumentViewerClient({
  initialStats = null,
  initialReviews = [],
}: DocumentViewerClientProps) {
  const [doc, setDoc] = useState<LoadedDocument | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfDocProxy, setPdfDocProxy] = useState<PdfDocumentProxy | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pdfNativeFallback, setPdfNativeFallback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerViewportRef = useRef<HTMLDivElement>(null);
  const docxMountRef = useRef<HTMLDivElement>(null);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.body.appendChild(script);
    });
  };

  const loadStylesheet = (href: string): void => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  };

  const clearDocument = useCallback(() => {
    if (pdfDocProxy) {
      try {
        pdfDocProxy.destroy();
      } catch {
        // ignore
      }
      setPdfDocProxy(null);
    }
    if (doc?.url) {
      URL.revokeObjectURL(doc.url);
    }
    if (docxMountRef.current) {
      docxMountRef.current.innerHTML = '';
    }
    setDoc(null);
    setZoom(100);
    setRotation(0);
    setPdfPageCount(0);
    setPdfNativeFallback(false);
    setRenderError(null);
    setIsLoading(false);
  }, [doc, pdfDocProxy]);

  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        try {
          pdfDocProxy.destroy();
        } catch {
          // ignore
        }
      }
      if (doc?.url) {
        URL.revokeObjectURL(doc.url);
      }
    };
  }, [doc, pdfDocProxy]);

  const handleFile = async (file: File) => {
    clearDocument();
    setIsLoading(true);
    setRenderError(null);
    setStatusMessage('Reading file into local browser memory...');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const arrayBuffer = await file.arrayBuffer();
      const blobUrl = URL.createObjectURL(file);

      const baseDoc: LoadedDocument = {
        name: file.name,
        size: file.size,
        extension,
        url: blobUrl,
        arrayBuffer,
      };

      if (['xlsx', 'xls', 'ods', 'csv'].includes(extension)) {
        setStatusMessage('Parsing spreadsheet sheets and data...');
        await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');

        if (window.XLSX) {
          const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
          const excelSheets = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const data = window.XLSX!.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            return { name: sheetName, data };
          });
          baseDoc.excelSheets = excelSheets;
          baseDoc.activeSheetIndex = 0;
        }
      } else if (['pptx'].includes(extension)) {
        setStatusMessage('Extracting slide contents...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

        if (window.JSZip) {
          const zip = await window.JSZip.loadAsync(arrayBuffer);
          const slideFiles = Object.keys(zip.files).filter((fname) =>
            /^ppt\/slides\/slide\d+\.xml$/i.test(fname)
          );

          slideFiles.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });

          const pptxSlides = [];
          for (let i = 0; i < slideFiles.length; i++) {
            const xmlContent = await zip.files[slideFiles[i]].async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
            const textNodes = xmlDoc.getElementsByTagName('a:t');

            const paragraphs: string[] = [];
            for (let j = 0; j < textNodes.length; j++) {
              const textVal = textNodes[j].textContent?.trim();
              if (textVal) paragraphs.push(textVal);
            }

            pptxSlides.push({
              slideNumber: i + 1,
              title: paragraphs[0] || `Slide ${i + 1}`,
              content: paragraphs.slice(1),
            });
          }

          baseDoc.pptxSlides = pptxSlides.length > 0 ? pptxSlides : [
            { slideNumber: 1, title: file.name, content: ['Presentation loaded. Ready for viewing.'] }
          ];
          baseDoc.currentSlideIndex = 0;
        }
      } else if (['txt', 'md', 'json', 'html', 'xml', 'log', 'css', 'js', 'ts'].includes(extension)) {
        setStatusMessage('Loading text document...');
        const text = await file.text();
        baseDoc.textContent = text;
        baseDoc.lines = text.split('\n');
      }

      setDoc(baseDoc);
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      setRenderError(err instanceof Error ? err.message : 'Error reading document.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  useEffect(() => {
    if (!doc || doc.extension !== 'pdf') return;

    let isSubscribed = true;

    async function initPdf() {
      try {
        setIsLoading(true);
        setStatusMessage('Initializing PDF engine...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

        if (!window.pdfjsLib) {
          throw new Error('PDF.js library failed to load.');
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = window.pdfjsLib.getDocument({
          data: doc!.arrayBuffer.slice(0),
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (!isSubscribed) return;

        setPdfDocProxy(pdf);
        setPdfPageCount(pdf.numPages);
      } catch (err: unknown) {
        console.warn('PDF.js canvas init failed, enabling native browser PDF viewer fallback:', err);
        if (isSubscribed) {
          setPdfNativeFallback(true);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
          setStatusMessage('');
        }
      }
    }

    initPdf();

    return () => {
      isSubscribed = false;
    };
  }, [doc]);

  useEffect(() => {
    if (!doc || doc.extension !== 'docx' || !docxMountRef.current) return;

    let isSubscribed = true;

    async function renderWord() {
      try {
        setIsLoading(true);
        setStatusMessage('Rendering Word document with full styles...');

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        loadStylesheet('https://cdn.jsdelivr.net/npm/docx-preview@0.3.5/dist/docx-preview.css');
        await loadScript('https://cdn.jsdelivr.net/npm/docx-preview@0.3.5/dist/docx-preview.js');

        if (!isSubscribed || !docxMountRef.current) return;
        docxMountRef.current.innerHTML = '';

        let rendered = false;

        if (window.docx) {
          try {
            await window.docx.renderAsync(
              doc!.arrayBuffer.slice(0),
              docxMountRef.current,
              null,
              {
                className: 'docx-preview-body',
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                breakPages: true,
                renderHeaders: true,
                renderFooters: true,
              }
            );
            rendered = true;
          } catch (docxErr) {
            console.warn('Primary docx-preview failed, using Mammoth fallback:', docxErr);
          }
        }

        if (!rendered) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
          if (window.mammoth && docxMountRef.current) {
            const res = await window.mammoth.convertToHtml({
              arrayBuffer: doc!.arrayBuffer.slice(0),
            });
            docxMountRef.current.innerHTML = `
              <div class="prose max-w-none text-slate-800 p-6 sm:p-10 leading-relaxed font-sans">
                ${res.value}
              </div>
            `;
            rendered = true;
          }
        }

        if (!rendered && window.JSZip && docxMountRef.current) {
          const zip = await window.JSZip.loadAsync(doc!.arrayBuffer.slice(0));
          const xmlFile = zip.files['word/document.xml'];
          if (xmlFile) {
            const xml = await xmlFile.async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'application/xml');
            const pNodes = xmlDoc.getElementsByTagName('w:p');
            const textArr: string[] = [];

            for (let i = 0; i < pNodes.length; i++) {
              const tNodes = pNodes[i].getElementsByTagName('w:t');
              let pText = '';
              for (let j = 0; j < tNodes.length; j++) {
                pText += tNodes[j].textContent || '';
              }
              if (pText.trim()) textArr.push(`<p class="mb-3">${pText}</p>`);
            }

            docxMountRef.current.innerHTML = `
              <div class="prose max-w-none text-slate-800 p-6">
                ${textArr.join('')}
              </div>
            `;
            rendered = true;
          }
        }

        if (!rendered) {
          throw new Error('Could not parse Word document structures.');
        }
      } catch (err: unknown) {
        console.error('DOCX Rendering error:', err);
        if (isSubscribed) {
          setRenderError(
            err instanceof Error ? err.message : 'Could not render Word document.'
          );
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
          setStatusMessage('');
        }
      }
    }

    renderWord();

    return () => {
      isSubscribed = false;
    };
  }, [doc]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <header className="sticky top-20 z-40 bg-white/95 dark:bg-darkBg-card/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to home"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          {doc ? (
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {doc.name}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                <span>•</span>
                <span className="uppercase font-semibold text-rose-500">{doc.extension}</span>
                {pdfPageCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{pdfPageCount} {pdfPageCount === 1 ? 'Page' : 'Pages'}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                View Documents Online
              </h1>
              <p className="text-[11px] text-slate-400">
                Direct in-browser viewer without conversion or downloads
              </p>
            </div>
          )}
        </div>

        {doc && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(prev - 15, 40))}
                className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="text-xs font-mono font-bold px-2 text-slate-700 dark:text-slate-300 hover:text-rose-500 transition-colors"
                title="Reset zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 15, 200))}
                className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom In"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {['pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg'].includes(doc.extension) && (
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                title="Rotate 90 degrees"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Print document"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={clearDocument}
              className="px-4 py-2 bg-[#FF2E54] hover:bg-[#E02447] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Open New File</span>
            </button>
          </div>
        )}
      </header>

      <div
        ref={viewerViewportRef}
        className="flex-1 relative flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto"
      >
        {isLoading && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-darkBg-card/90 backdrop-blur border border-rose-200 dark:border-rose-900/50 shadow-lg px-4 py-2 rounded-full flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 border-2 border-rose-300 border-t-[#FF2E54] rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{statusMessage}</span>
          </div>
        )}

        {renderError && (
          <div className="w-full max-w-xl mx-auto my-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs shadow-sm">
            <p className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Document Preview Notice</span>
            </p>
            <p className="mt-1 leading-relaxed">{renderError}</p>
          </div>
        )}

        {!doc && (
          <div className="w-full max-w-2xl text-center space-y-6 my-auto py-12">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                View Documents <span className="text-[#FF2E54]">Directly</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Open and read DOCX, PDF, XLSX, PPTX, CSV, and text files directly in your browser without converting or installing software.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] rounded-3xl p-10 sm:p-16 bg-white dark:bg-darkBg-card shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>

              <p className="text-base font-bold text-slate-800 dark:text-white">
                Drag & drop your document here
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                or click to browse your computer or mobile files
              </p>

              <button
                type="button"
                className="px-6 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-full shadow-md shadow-rose-500/25 transition-all"
              >
                Choose Document to Preview
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">Word (.DOCX)</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">PDF (.PDF)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">Excel (.XLSX)</span>
                <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">PowerPoint (.PPTX)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Images & Code</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Files stay 100% on your machine. Memory is released automatically when closed.</span>
            </p>
          </div>
        )}

        {doc && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {doc.extension === 'pdf' && (
              <>
                {pdfNativeFallback ? (
                  <div className="w-full h-[82vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <iframe
                      src={`${doc.url}#toolbar=1&navpanes=0`}
                      title={doc.name}
                      className="w-full h-full border-none"
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {pdfDocProxy &&
                      Array.from({ length: pdfPageCount }).map((_, i) => (
                        <PdfPageCanvas
                          key={i + 1}
                          pdf={pdfDocProxy}
                          pageNum={i + 1}
                          totalPages={pdfPageCount}
                          zoom={zoom}
                          rotation={rotation}
                        />
                      ))}
                  </div>
                )}
              </>
            )}

            {doc.extension === 'docx' && (
              <div
                className="w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-12 overflow-x-auto min-h-[70vh] transition-all"
                style={{
                  transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                  transformOrigin: 'top center',
                }}
              >
                <div ref={docxMountRef} className="docx-render-host prose max-w-none" />
              </div>
            )}

            {['xlsx', 'xls', 'ods', 'csv'].includes(doc.extension) && doc.excelSheets && (
              <div className="w-full bg-white dark:bg-darkBg-card rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[75vh] overflow-hidden">
                <div className="flex-1 overflow-auto">
                  {doc.excelSheets[doc.activeSheetIndex || 0] ? (
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-500 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-2 w-12 text-center font-mono border-r border-slate-200 dark:border-slate-700">#</th>
                          {doc.excelSheets[doc.activeSheetIndex || 0].data[0]?.map((_, colIndex) => (
                            <th
                              key={colIndex}
                              className="px-4 py-2 font-mono font-bold uppercase border-r border-slate-200 dark:border-slate-700 min-w-[120px]"
                            >
                              {String.fromCharCode(65 + (colIndex % 26))}
                              {colIndex >= 26 ? Math.floor(colIndex / 26) : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {doc.excelSheets[doc.activeSheetIndex || 0].data.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-rose-50/30 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-3 py-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 select-none">
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-4 py-1.5 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 truncate max-w-sm"
                              >
                                {cell !== undefined && cell !== null ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400">Sheet is empty.</div>
                  )}
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center gap-1 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Sheets:</span>
                  {doc.excelSheets.map((sheet, sIdx) => (
                    <button
                      key={sheet.name}
                      type="button"
                      onClick={() => setDoc({ ...doc, activeSheetIndex: sIdx })}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        (doc.activeSheetIndex || 0) === sIdx
                          ? 'bg-white dark:bg-darkBg text-[#FF2E54] shadow-sm border border-slate-200 dark:border-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {doc.extension === 'pptx' && doc.pptxSlides && (
              <div className="w-full space-y-4">
                <div className="aspect-[16/9] w-full bg-white dark:bg-darkBg-card rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF2E54]">
                      Slide {(doc.currentSlideIndex || 0) + 1} of {doc.pptxSlides.length}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {doc.pptxSlides[doc.currentSlideIndex || 0]?.title}
                    </h2>
                    <div className="space-y-2 pt-2">
                      {doc.pptxSlides[doc.currentSlideIndex || 0]?.content.map((point, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
                        >
                          • {point}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <span>{doc.name}</span>
                    <span>Slide Viewer</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-darkBg-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button
                    type="button"
                    disabled={(doc.currentSlideIndex || 0) <= 0}
                    onClick={() =>
                      setDoc({ ...doc, currentSlideIndex: Math.max((doc.currentSlideIndex || 0) - 1, 0) })
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-30"
                  >
                    &larr; Previous
                  </button>

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Slide {(doc.currentSlideIndex || 0) + 1} / {doc.pptxSlides.length}
                  </span>

                  <button
                    type="button"
                    disabled={(doc.currentSlideIndex || 0) >= doc.pptxSlides.length - 1}
                    onClick={() =>
                      setDoc({
                        ...doc,
                        currentSlideIndex: Math.min((doc.currentSlideIndex || 0) + 1, doc.pptxSlides!.length - 1),
                      })
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-30"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}

            {['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(doc.extension) && (
              <div
                className="bg-white dark:bg-darkBg-card p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-transform"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.url}
                  alt={doc.name}
                  className="max-h-[75vh] w-auto object-contain rounded-lg mx-auto"
                />
              </div>
            )}

            {['txt', 'md', 'json', 'html', 'xml', 'log', 'css', 'js', 'ts'].includes(doc.extension) &&
              doc.textContent && (
                <div
                  className="w-full bg-white dark:bg-darkBg-card rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[75vh]"
                  style={{
                    transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                    transformOrigin: 'top center',
                  }}
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Line Count: {doc.lines?.length || 0}
                    </span>
                    <span className="font-mono text-slate-400 uppercase">{doc.extension}</span>
                  </div>
                  <pre className="p-6 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-auto flex-1 whitespace-pre-wrap leading-relaxed">
                    {doc.textContent}
                  </pre>
                </div>
              )}
          </div>
        )}

        <div className="w-full max-w-4xl mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <ReviewSection
            itemSlug="view-documents-online"
            toolName="View Documents Online"
            initialStats={initialStats}
            initialReviews={initialReviews}
          />
        </div>
      </div>
    </main>
  );
}

function PdfPageCanvas({
  pdf,
  pageNum,
  totalPages,
  zoom,
  rotation,
}: {
  pdf: PdfDocumentProxy;
  pageNum: number;
  totalPages: number;
  zoom: number;
  rotation: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    let renderTask: { cancel: () => void } | null = null;

    async function drawPage() {
      if (!canvasRef.current || !pdf) return;

      try {
        const page = await pdf.getPage(pageNum);
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1, rotation });
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
        const targetContainerWidth = Math.min(screenWidth - 48, 800);
        const scale = (targetContainerWidth / unscaledViewport.width) * (zoom / 100);
        const viewport = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

        renderTask = page.render({
          canvasContext: ctx,
          transform: transform || undefined,
          viewport,
        });

        await (renderTask as unknown as { promise: Promise<void> }).promise;
      } catch (err: unknown) {
        const errorName = (err as { name?: string })?.name;
        if (errorName !== 'RenderingCancelledException') {
          console.warn(`Page ${pageNum} render notice:`, err);
          if (!isCancelled) setRenderError(true);
        }
      }
    }

    drawPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdf, pageNum, zoom, rotation]);

  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center mx-auto mb-6 transition-all">
      {renderError ? (
        <div className="p-8 text-xs text-slate-400 font-mono text-center">
          Page {pageNum} could not be rendered
        </div>
      ) : (
        <canvas ref={canvasRef} className="block" />
      )}
      <div className="py-1 text-[10px] text-slate-400 font-mono tracking-wider text-center w-full bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 select-none">
        Page {pageNum} of {totalPages}
      </div>
    </div>
  );
}
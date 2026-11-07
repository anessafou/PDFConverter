// src/app/image-converter/ImageConverterClient.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReviewSection from '@/components/reviews/ReviewSection';
import { AggregateRatingStats, Review } from '@/core/reviews/reviews.interface';

type OutputFormat = 'JPG' | 'PNG' | 'WEBP' | 'GIF' | 'BMP' | 'TIFF' | 'ICO' | 'AVIF';

interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalExt: string;
  previewUrl: string;
  status: 'ready' | 'converting' | 'converted' | 'error';
  targetFormat: OutputFormat;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  errorMessage?: string;
}

const SUPPORTED_OUTPUT_FORMATS: { format: OutputFormat; label: string; desc: string }[] = [
  { format: 'JPG', label: 'JPG', desc: 'Standard photo compression (white background)' },
  { format: 'PNG', label: 'PNG', desc: 'Lossless quality with full alpha transparency' },
  { format: 'WEBP', label: 'WebP', desc: 'High-efficiency modern web graphics' },
  { format: 'GIF', label: 'GIF', desc: 'Static GIF image (single frame)' },
  { format: 'BMP', label: 'BMP', desc: 'Uncompressed 24-bit Windows Bitmap' },
  { format: 'TIFF', label: 'TIFF', desc: 'Baseline TIFF 6.0 desktop publishing format' },
  { format: 'ICO', label: 'ICO', desc: 'Standard multi-platform favicon & app icon' },
  { format: 'AVIF', label: 'AVIF', desc: 'High-efficiency next-gen format (if supported by browser)' },
];

function checkMimeEncodingSupport(mime: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mime);
    return dataUrl.startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

interface ImageConverterClientProps {
  initialStats?: AggregateRatingStats | null;
  initialReviews?: Review[];
}

export default function ImageConverterClient({
  initialStats = null,
  initialReviews = [],
}: ImageConverterClientProps) {
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('PNG');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [avifSupported, setAvifSupported] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvifSupported(checkMimeEncodingSupport('image/avif'));
  }, []);

  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, [queue]);

  const handleFormatChange = (newFormat: OutputFormat) => {
    if (newFormat === 'AVIF' && !avifSupported) {
      alert('AVIF canvas encoding is not supported by your current browser engine. Please choose WebP, PNG, or JPG.');
      return;
    }
    setSelectedFormat(newFormat);
    setQueue((prev) =>
      prev.map((item) => (item.status === 'ready' ? { ...item, targetFormat: newFormat } : item))
    );
  };

  const handleAddFiles = (fileList: FileList | File[]) => {
    const validFiles: QueueItem[] = [];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'ico', 'avif', 'svg', 'heic'];

    Array.from(fileList).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (file.type.startsWith('image/') || allowedExtensions.includes(ext)) {
        validFiles.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          originalExt: ext.toUpperCase(),
          previewUrl: URL.createObjectURL(file),
          status: 'ready',
          targetFormat: selectedFormat,
        });
      }
    });

    if (validFiles.length > 0) {
      setQueue((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setQueue([]);
  };

  const encodeBmp = (canvas: HTMLCanvasElement): Blob => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    view.setUint16(0, 0x4d42, false);
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    const bytes = new Uint8Array(buffer, 54);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const srcY = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcY * width + x) * 4;
        const dstIdx = y * rowSize + x * 3;
        bytes[dstIdx] = data[srcIdx + 2];
        bytes[dstIdx + 1] = data[srcIdx + 1];
        bytes[dstIdx + 2] = data[srcIdx];
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  };

  const encodeIco = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    let targetCanvas = canvas;
    if (canvas.width > 256 || canvas.height > 256) {
      const scale = 256 / Math.max(canvas.width, canvas.height);
      const resized = document.createElement('canvas');
      resized.width = Math.round(canvas.width * scale);
      resized.height = Math.round(canvas.height * scale);
      const rCtx = resized.getContext('2d');
      if (rCtx) rCtx.drawImage(canvas, 0, 0, resized.width, resized.height);
      targetCanvas = resized;
    }

    const pngBlob = await new Promise<Blob | null>((res) => targetCanvas.toBlob(res, 'image/png'));
    if (!pngBlob) throw new Error('PNG encoding failed');
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

    const icoHeader = new Uint8Array(6 + 16);
    const view = new DataView(icoHeader.buffer);
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);

    icoHeader[6] = targetCanvas.width >= 256 ? 0 : targetCanvas.width;
    icoHeader[7] = targetCanvas.height >= 256 ? 0 : targetCanvas.height;
    icoHeader[8] = 0;
    icoHeader[9] = 0;
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngBytes.length, true);
    view.setUint32(18, 22, true);

    return new Blob([icoHeader, pngBytes], { type: 'image/x-icon' });
  };

  const encodeTiff = (canvas: HTMLCanvasElement): Blob => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const numPixels = width * height;
    const pixelDataSize = numPixels * 4;

    const ifdOffset = 8;
    const numEntries = 11;
    const ifdSize = 2 + numEntries * 12 + 4;
    const extraOffset = ifdOffset + ifdSize;
    const extraSize = 8;
    const pixelsOffset = extraOffset + extraSize;
    const totalSize = pixelsOffset + pixelDataSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint16(0, 0x4949, false);
    view.setUint16(2, 42, true);
    view.setUint32(4, ifdOffset, true);

    let pos = ifdOffset;
    view.setUint16(pos, numEntries, true);
    pos += 2;

    const writeTag = (tag: number, type: number, count: number, val: number) => {
      view.setUint16(pos, tag, true);
      view.setUint16(pos + 2, type, true);
      view.setUint32(pos + 4, count, true);
      view.setUint32(pos + 8, val, true);
      pos += 12;
    };

    writeTag(256, 4, 1, width);
    writeTag(257, 4, 1, height);
    writeTag(258, 3, 4, extraOffset);
    writeTag(259, 3, 1, 1);
    writeTag(262, 3, 1, 2);
    writeTag(273, 4, 1, pixelsOffset);
    writeTag(277, 3, 1, 4);
    writeTag(278, 4, 1, height);
    writeTag(279, 4, 1, pixelDataSize);
    writeTag(282, 5, 1, 72);
    writeTag(296, 3, 1, 2);

    view.setUint32(pos, 0, true);
    view.setUint16(extraOffset, 8, true);
    view.setUint16(extraOffset + 2, 8, true);
    view.setUint16(extraOffset + 4, 8, true);
    view.setUint16(extraOffset + 6, 8, true);

    bytes.set(imgData.data, pixelsOffset);
    return new Blob([buffer], { type: 'image/tiff' });
  };

  const convertSingleItem = async (item: QueueItem): Promise<QueueItem> => {
    return new Promise((resolve) => {
      if (item.originalExt === 'HEIC') {
        resolve({
          ...item,
          status: 'error',
          errorMessage: 'HEIC format requires native Apple decoding or specialized HEIC conversion.',
        });
        return;
      }

      const img = new Image();

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({ ...item, status: 'error', errorMessage: 'Canvas context unavailable' });
            return;
          }

          if (item.targetFormat === 'JPG' || item.targetFormat === 'BMP') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          let outputBlob: Blob | null = null;
          let finalTargetFormat = item.targetFormat;

          if (item.targetFormat === 'JPG') {
            outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
          } else if (item.targetFormat === 'PNG') {
            outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          } else if (item.targetFormat === 'WEBP') {
            outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.90));
          } else if (item.targetFormat === 'GIF') {
            if (checkMimeEncodingSupport('image/gif')) {
              outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/gif'));
            } else {
              outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
              finalTargetFormat = 'PNG';
            }
          } else if (item.targetFormat === 'BMP') {
            outputBlob = encodeBmp(canvas);
          } else if (item.targetFormat === 'ICO') {
            outputBlob = await encodeIco(canvas);
          } else if (item.targetFormat === 'TIFF') {
            outputBlob = encodeTiff(canvas);
          } else if (item.targetFormat === 'AVIF') {
            if (checkMimeEncodingSupport('image/avif')) {
              outputBlob = await new Promise((r) => canvas.toBlob(r, 'image/avif', 0.85));
            } else {
              resolve({
                ...item,
                status: 'error',
                errorMessage: 'AVIF encoding is unsupported by your browser. Please select WebP or PNG.',
              });
              return;
            }
          }

          if (!outputBlob) {
            resolve({ ...item, status: 'error', errorMessage: 'Failed to encode image data.' });
            return;
          }

          resolve({
            ...item,
            status: 'converted',
            targetFormat: finalTargetFormat,
            convertedBlob: outputBlob,
            convertedUrl: URL.createObjectURL(outputBlob),
            convertedSize: outputBlob.size,
          });
        } catch (err: unknown) {
          resolve({
            ...item,
            status: 'error',
            errorMessage: err instanceof Error ? err.message : 'Conversion error',
          });
        }
      };

      img.onerror = () => {
        resolve({
          ...item,
          status: 'error',
          errorMessage: 'Unable to decode image file.',
        });
      };

      img.src = item.previewUrl;
    });
  };

  const handleConvertAll = async () => {
    if (queue.length === 0) return;
    setIsConvertingAll(true);

    setQueue((prev) =>
      prev.map((item) => (item.status === 'ready' ? { ...item, status: 'converting' } : item))
    );

    const updatedQueue: QueueItem[] = [];

    for (const item of queue) {
      if (item.status === 'converted' && item.convertedBlob) {
        updatedQueue.push(item);
      } else {
        const converted = await convertSingleItem(item);
        updatedQueue.push(converted);
      }
    }

    setQueue(updatedQueue);
    setIsConvertingAll(false);
  };

  const handleDownloadSingle = (item: QueueItem) => {
    if (!item.convertedUrl) return;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = item.targetFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = `${baseName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    const convertedItems = queue.filter((i) => i.status === 'converted' && i.convertedBlob);
    if (convertedItems.length === 0) return;

    try {
      if (!(window as unknown as { JSZip?: unknown }).JSZip) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load zip library'));
          document.body.appendChild(script);
        });
      }

      type JSZipConstructor = new () => {
        file: (name: string, data: Blob) => void;
        generateAsync: (options: { type: 'blob' }) => Promise<Blob>;
      };

      const JSZipClass = (window as unknown as { JSZip: JSZipConstructor }).JSZip;
      if (!JSZipClass) throw new Error('ZIP generator unavailable');

      const zip = new JSZipClass();

      convertedItems.forEach((item, index) => {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || `image_${index + 1}`;
        const ext = item.targetFormat.toLowerCase();
        zip.file(`${baseName}.${ext}`, item.convertedBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = 'converted-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 30000);
    } catch {
      convertedItems.forEach((item) => handleDownloadSingle(item));
    }
  };

  const convertedCount = queue.filter((i) => i.status === 'converted').length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Image Converter
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Universal multi-format bulk image converter. Batch convert photos and graphics to any format instantly with zero quality loss.
        </p>

        {/* ─── Interactive Batch Conversion Workspace ──────────────────────── */}
        <div className="w-full max-w-3xl mx-auto my-8 bg-white dark:bg-darkBg-card rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-left transition-all">
          <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              1. Choose Target Output Format:
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_OUTPUT_FORMATS.map(({ format, label }) => {
                const isSelected = selectedFormat === format;
                const isAvifDisabled = format === 'AVIF' && !avifSupported;

                return (
                  <button
                    key={format}
                    type="button"
                    disabled={isAvifDisabled}
                    onClick={() => handleFormatChange(format)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#FF2E54] text-white shadow-md shadow-rose-500/25 scale-105'
                        : isAvifDisabled
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed opacity-50'
                        : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Target: <strong className="text-slate-800 dark:text-slate-200">{selectedFormat}</strong> —{' '}
              {SUPPORTED_OUTPUT_FORMATS.find((f) => f.format === selectedFormat)?.desc}
            </p>
          </div>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept="image/*, .heic, .tiff, .bmp, .webp, .svg, .ico, .avif"
            onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] rounded-2xl p-8 sm:p-12 text-center transition-all bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer group mb-6"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-white">
              Drag & drop multiple images here
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              or click to browse from your computer or phone
            </p>
            <button
              type="button"
              className="px-6 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-full shadow-md shadow-rose-500/25 transition-all"
            >
              Choose Images to Convert
            </button>
            <p className="text-[11px] text-slate-400 mt-3">
              Supports JPG, PNG, WebP, GIF, BMP, TIFF, SVG, and ICO • Batch processing
            </p>
          </div>

          {queue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Image Queue ({queue.length} {queue.length === 1 ? 'file' : 'files'})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    + Add More
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-11 h-11 object-cover rounded-lg bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-xs">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {(item.size / 1024).toFixed(0)} KB •{' '}
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            {item.originalExt} → {item.targetFormat}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'ready' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Ready
                        </span>
                      )}

                      {item.status === 'converting' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          Converting...
                        </span>
                      )}

                      {item.status === 'converted' && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            ✓ Converted
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all"
                          >
                            Download
                          </button>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700" title={item.errorMessage}>
                          Error
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 text-sm font-bold"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400">
                  Converting to <strong className="text-[#FF2E54]">{selectedFormat}</strong> directly in browser memory.
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {convertedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download All as .ZIP ({convertedCount})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleConvertAll}
                    disabled={isConvertingAll}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/25 transition-all disabled:opacity-50"
                  >
                    {isConvertingAll ? 'Converting Images...' : `Convert All to ${selectedFormat}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Which image formats can I convert to?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You can convert directly to JPG, PNG (with alpha transparency), WebP, BMP, TIFF, and ICO (favicon) formats.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Can I convert multiple images at once?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Yes, our Image Converter supports batch processing. Upload multiple photos at once and download them individually or as a single combined ZIP archive.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Are my photos uploaded to any external server?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No. All image processing runs directly inside your browser using HTML5 Canvas technology. Your photos never leave your device.
              </p>
            </div>
          </div>
        </section>

        <ReviewSection
          itemSlug="image-converter"
          toolName="Image Converter"
          initialStats={initialStats}
          initialReviews={initialReviews}
        />
      </div>
    </main>
  );
}
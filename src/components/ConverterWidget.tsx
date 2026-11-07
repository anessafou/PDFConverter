'use client';

import React, { useState, useRef } from 'react';
import { ToolDefinition } from '@/config/tools-registry';
import { runConversion, triggerFileDownload, ConversionResult } from '@/core/converter-engine';

export default function ConverterWidget({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const executeConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(20);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const conversionResult = await runConversion(file, tool);
      clearInterval(interval);
      setProgress(100);
      setResult(conversionResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Floating Colored Icons Matching Reference */}
      <div className="hidden sm:flex absolute -left-6 top-8 w-9 h-9 rounded-xl bg-red-500 text-white items-center justify-center font-bold text-xs shadow-lg shadow-red-500/30 z-20 animate-bounce">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="hidden sm:flex absolute -left-6 top-24 w-9 h-9 rounded-xl bg-blue-600 text-white items-center justify-center font-bold text-xs shadow-lg shadow-blue-600/30 z-20">
        W
      </div>
      <div className="hidden sm:flex absolute -left-6 top-40 w-9 h-9 rounded-xl bg-emerald-500 text-white items-center justify-center font-bold text-xs shadow-lg shadow-emerald-500/30 z-20">
        X
      </div>

      <div className="hidden sm:flex absolute -right-6 top-12 w-9 h-9 rounded-xl bg-purple-600 text-white items-center justify-center font-bold text-xs shadow-lg shadow-purple-600/30 z-20">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="hidden sm:flex absolute -right-6 top-28 w-9 h-9 rounded-xl bg-amber-500 text-white items-center justify-center font-bold text-[10px] shadow-lg shadow-amber-500/30 z-20">
        JPG
      </div>

      {/* Main Dropzone Card Container */}
      <div className="relative bg-white dark:bg-darkBg-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/90 dark:border-slate-800 transition-colors">
        {/* Subtle Browser Window Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">PDFConverter</span>
          </div>
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
            {tool.name}
          </span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Upload Box */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] rounded-2xl p-8 sm:p-12 text-center transition-all bg-slate-50/50 dark:bg-slate-900/40"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <p className="text-base font-bold text-slate-800 dark:text-white">
              Drag & drop your file here
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              or click to browse from your device
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-xs rounded-full shadow-md shadow-rose-500/30 hover:scale-105 transition-all"
            >
              Choose File
            </button>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
              Supports PDF, Word, Excel, JPG, PNG and more
            </p>
          </div>
        )}

        {/* Selected File State */}
        {file && !result && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>

            {isProcessing && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF2E54] to-pink-500 h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={executeConvert}
              disabled={isProcessing}
              className="w-full py-3 bg-[#FF2E54] hover:bg-[#E02447] text-white font-bold text-sm rounded-full shadow-md shadow-rose-500/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Converting...' : `Convert to ${tool.outputFormat.toUpperCase()} Now`}
            </button>
          </div>
        )}

        {/* Download Ready State */}
        {result && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Conversion Successful!</h4>
            <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">{result.fileName}</p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => triggerFileDownload(result)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow transition-all flex items-center gap-2"
              >
                Download File
              </button>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-full"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}

        {/* Bottom Reassurance from Reference Image */}
        <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="font-semibold">No registration required</span>
        </div>
      </div>
    </div>
  );
}
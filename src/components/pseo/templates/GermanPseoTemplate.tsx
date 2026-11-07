// src/components/pseo/templates/GermanPseoTemplate.tsx
import React from 'react';
import { ToolDefinition, PseoModifier } from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';

export default function GermanPseoTemplate({
  tool,
  modifier,
  canonicalSlug,
}: {
  tool: ToolDefinition;
  modifier: PseoModifier;
  canonicalSlug: string;
}) {
  const titles: Record<PseoModifier, string> = {
    'for-mac': `${tool.name} für Mac (Safari & Apple Silicon)`,
    'for-windows': `${tool.name} für Windows 11 & 10`,
    'on-iphone': `${tool.name} auf dem iPhone & iPad`,
    'without-watermark': `${tool.name} ohne Wasserzeichen (Kostenlos)`,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800 dark:text-slate-100">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {titles[modifier]}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Konvertieren Sie Ihre {tool.inputFormat.join('/')}-Dokumente sicher und verlustfrei in das {tool.outputFormat.toUpperCase()}-Format.
        </p>
      </div>

      <ConverterWidget tool={tool} />

      {/* German-Specific Feature: DSGVO-Sicherheit & DIN-Normen */}
      <section className="bg-white dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <span>🔒</span>
          <span>100% DSGVO-konforme Verarbeitung ohne Server-Speicherung</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Ihre vertraulichen Dokumente, Verträge und Bewerbungsunterlagen werden direkt im Arbeitsspeicher Ihres Browsers verarbeitet. Es erfolgt keine dauerhafte Speicherung oder Weitergabe an Dritte.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">DIN A4 konform</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Wasserzeichen</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Keine (0%)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Software</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Keine Installation</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Kosten</span>
            <span className="font-bold text-emerald-600">Dauerhaft 0 €</span>
          </div>
        </div>
      </section>

      <ReviewSection itemSlug={canonicalSlug} toolName={tool.name} />
    </div>
  );
}
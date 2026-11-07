// src/components/pseo/templates/SpanishPseoTemplate.tsx
import React from 'react';
import { ToolDefinition, PseoModifier } from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';

export default function SpanishPseoTemplate({
  tool,
  modifier,
  canonicalSlug,
}: {
  tool: ToolDefinition;
  modifier: PseoModifier;
  canonicalSlug: string;
}) {
  const titles: Record<PseoModifier, string> = {
    'for-mac': `${tool.name} para Mac sin instalar programas`,
    'for-windows': `${tool.name} en Windows 11 y 10 (Gratis)`,
    'on-iphone': `${tool.name} en iPhone y Celular`,
    'without-watermark': `${tool.name} sin Marcas de Agua (100% Gratis)`,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800 dark:text-slate-100">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {titles[modifier]}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Convierte archivos {tool.inputFormat.join('/')} a {tool.outputFormat.toUpperCase()} al instante. Sin registros, sin suscripciones y sin límites ocultos.
        </p>
      </div>

      <ConverterWidget tool={tool} />

      {/* Spanish-Specific Feature: Enfoque Móvil, WhatsApp y Estudiantes */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <span>📱</span>
            <span>Comparte directo en WhatsApp y Drive</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Una vez convertido tu archivo, descárgalo directamente en tu dispositivo o súbelo a Google Drive, WhatsApp o Classroom con un solo toque.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-[#FF2E54] font-bold text-sm">
            <span>🎓</span>
            <span>Ideal para estudiantes y trabajos diarios</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sin marcas de agua molestas ni restricciones de 2 archivos por día como otras plataformas. 100% libre para tus tareas y proyectos.
          </p>
        </div>
      </section>

      <ReviewSection itemSlug={canonicalSlug} toolName={tool.name} />
    </div>
  );
}
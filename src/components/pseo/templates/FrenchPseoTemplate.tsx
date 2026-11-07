// src/components/pseo/templates/FrenchPseoTemplate.tsx
import React from 'react';
import Link from 'next/link';
import { ToolDefinition, PseoModifier } from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';

export default function FrenchPseoTemplate({
  tool,
  modifier,
  canonicalSlug,
}: {
  tool: ToolDefinition;
  modifier: PseoModifier;
  canonicalSlug: string;
}) {
  const titles: Record<PseoModifier, string> = {
    'for-mac': `${tool.name} sur Mac (Safari & Finder)`,
    'for-windows': `${tool.name} sur Windows 11 & 10`,
    'on-iphone': `${tool.name} sur iPhone & iPad`,
    'without-watermark': `${tool.name} Gratuit et Sans Filigrane`,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800 dark:text-slate-100">
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {titles[modifier]}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Conversion rapide et conforme de vos documents {tool.inputFormat.join('/')} en format {tool.outputFormat.toUpperCase()} sans logiciel payant.
        </p>
      </div>

      {/* Converter Widget */}
      <ConverterWidget tool={tool} />

      {/* French-Specific Feature: Conformité Démarches Administratives */}
      <section className="bg-white dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">🏛️</span>
          <span>Prêt pour vos dossiers administratifs français</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Les plateformes publiques françaises (France Travail, CAF, DossierFacile, impôts) imposent des formats standardisés sans perte de texte. Notre outil génère un document propre, allégé et immédiatement lisible par les téléservices officiels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold block text-slate-900 dark:text-white">Respect du RGPD</span>
            <span className="text-[11px] text-slate-500">Traitement en mémoire vive locale sans revente de données.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold block text-slate-900 dark:text-white">Sans filigrane publicitaire</span>
            <span className="text-[11px] text-slate-500">Document vierge de tout logo ou tampon commercial.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold block text-slate-900 dark:text-white">Poids optimisé</span>
            <span className="text-[11px] text-slate-500">Compatible avec les limites de téléversement (2 Mo / 5 Mo).</span>
          </div>
        </div>
      </section>

      {/* Guide spécifique avec étapes réelles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Comment convertir vos fichiers {modifier === 'for-mac' ? 'sur macOS avec Safari' : modifier === 'on-iphone' ? 'sur votre iPhone' : 'sur Windows'} ?
        </h2>
        <div className="grid gap-3">
          <div className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FF2E54] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sélectionnez votre document depuis vos dossiers locaux ou glissez-le directement dans votre navigateur.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FF2E54] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Le moteur exécute la conversion en conservant fidèlement les polices, tableaux et marges de votre mise en page.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FF2E54] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Téléchargez votre document finalisé au format {tool.outputFormat.toUpperCase()} prêt pour vos démarches.
            </p>
          </div>
        </div>
      </section>

      <ReviewSection itemSlug={canonicalSlug} toolName={tool.name} />
    </div>
  );
}
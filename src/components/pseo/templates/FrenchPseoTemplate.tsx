import { getToolContent } from '@/config/tool-content';
import LocalizedGuideDetails from '@/components/pseo/LocalizedGuideDetails';
import { localizedPseoHeading } from '@/config/localized-pseo-metadata';

import { translate } from '@/locales/translate';
import { getLocalizedPseoEditorial } from '@/config/localized-pseo-editorial';
// src/components/pseo/templates/FrenchPseoTemplate.tsx
import React from 'react';
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
  const locale = 'fr' as const;
  const t = (value: string) => translate(locale, value);

  const content = getToolContent(tool, locale, modifier);
  const editorial = getLocalizedPseoEditorial(locale, tool.slug, modifier);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800 dark:text-slate-100">
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {localizedPseoHeading(locale, tool.slug, modifier)}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {editorial?.intro ?? content.formats}
        </p>
      </div>

      {/* Converter Widget */}
      <ConverterWidget tool={tool} />

      <LocalizedGuideDetails locale={locale} content={content} editorial={editorial} />

      <ReviewSection itemSlug={canonicalSlug} toolName={t(tool.name)} />
    </div>
  );
}

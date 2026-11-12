import { getToolContent } from '@/config/tool-content';
import LocalizedGuideDetails from '@/components/pseo/LocalizedGuideDetails';
import { localizedPseoHeading } from '@/config/localized-pseo-metadata';

import { translate } from '@/locales/translate';
// src/components/pseo/templates/ArabicPseoTemplate.tsx
import React from 'react';
import { ToolDefinition, PseoModifier } from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';

export default function ArabicPseoTemplate({
  tool,
  modifier,
  canonicalSlug,
}: {
  tool: ToolDefinition;
  modifier: PseoModifier;
  canonicalSlug: string;
}) {
  const locale = 'ar' as const;
  const t = (value: string) => translate(locale, value);

  const content = getToolContent(tool, locale, modifier);

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-8 text-right font-sans text-slate-800 dark:text-slate-100">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {localizedPseoHeading(locale, tool.slug, modifier)}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          {content.formats}
        </p>
      </div>

      <ConverterWidget tool={tool} />

      <LocalizedGuideDetails locale={locale} content={content} />

      <ReviewSection itemSlug={canonicalSlug} toolName={t(tool.name)} />
    </div>
  );
}
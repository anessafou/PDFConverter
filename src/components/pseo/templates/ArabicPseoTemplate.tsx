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
  const titles: Record<PseoModifier, string> = {
    'for-mac': `${tool.name} لأجهزة الماك (Mac)`,
    'for-windows': `${tool.name} لنظام ويندوز 11 و 10`,
    'on-iphone': `${tool.name} للآيفون والآيباد`,
    'without-watermark': `${tool.name} مجاناً وبدون علامة مائية`,
  };

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-8 text-right font-sans text-slate-800 dark:text-slate-100">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {titles[modifier]}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          حوّل ملفاتك من {tool.inputFormat.join('/')} إلى {tool.outputFormat.toUpperCase()} بسرعة ودقة فائقة وبدون أي برامج مدفوعة.
        </p>
      </div>

      <ConverterWidget tool={tool} />

      {/* ميزة خاصة باللغة العربية: الحفاظ على الحروف والاتجاه والمنصات الرسمية */}
      <section className="bg-white dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <span>✨</span>
          <span>الحفاظ الكامل على الخط العربي وتنسيق الجداول</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          يتجنب محركنا مشاكل الحروف المقلوبة أو المقطعة التي تعاني منها الأدوات الأخرى. يتم تصدير المستند بدقة عالية ليكون جاهزاً للتقديم في المنصات الحكومية، الجامعات، والجهات الرسمية.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">بدون علامة مائية</span>
            <span className="text-[11px] text-slate-500">مستند نظيف تماماً وخالٍ من أي شعارات دعائية.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">خصوصية تامة</span>
            <span className="text-[11px] text-slate-500">معالجة الملفات في ذاكرة المتصفح دون حفظها على خوادم خارجية.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">مجاني 100%</span>
            <span className="text-[11px] text-slate-500">لا حاجة لتسجيل الدخول أو إدخال بريدك الإلكتروني.</span>
          </div>
        </div>
      </section>

      <ReviewSection itemSlug={canonicalSlug} toolName={tool.name} />
    </div>
  );
}
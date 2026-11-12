import type { Locale } from '@/config/i18n-registry';
import { translate } from '@/locales/translate';
import type { getToolContent } from '@/config/tool-content';
import type { LocalizedPseoEditorial } from '@/config/localized-pseo-editorial';
import Link from 'next/link';

export default function LocalizedGuideDetails({ locale, content, editorial }: {
  locale: Locale;
  content: ReturnType<typeof getToolContent>;
  editorial?: LocalizedPseoEditorial;
}) {
  return (
    <section className="bg-white dark:bg-[#111625] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {content.specs.map(spec => (
          <div key={spec.label} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="block text-slate-500">{spec.label}</span>
            <span className="font-bold text-slate-900 dark:text-white"><bdi>{spec.value}</bdi></span>
          </div>
        ))}
      </div>
      {editorial && (
        <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editorial.heading}</h2>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">{editorial.stepsHeading}</h3>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {editorial.steps.map(step => (
              <li key={step.title}>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{step.title}: </span>
                {step.description}
              </li>
            ))}
          </ol>
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">{editorial.outputHeading}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{editorial.output}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">{editorial.limitationsHeading}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{editorial.limitations}</p>
          </div>
          {editorial.relatedLink && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <Link className="underline underline-offset-2 hover:text-rose-600" href={editorial.relatedLink.href}>
                {editorial.relatedLink.label}
              </Link>
            </p>
          )}
        </div>
      )}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{translate(locale, 'Frequently Asked Questions')}</h2>
      <div className="space-y-4">
        {content.faqs.map(faq => (
          <div key={faq.q}>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{faq.q}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{editorial?.faqAnswerOverrides?.[faq.q] ?? faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

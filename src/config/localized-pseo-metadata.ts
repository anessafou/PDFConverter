import { DICTIONARIES } from '@/locales/dictionaries';
import type { Metadata } from 'next';
import type { Locale } from './i18n-registry';
import type { PseoModifier } from './tools-registry';
import { getPseoLanguageAlternates, type PseoPublication } from './pseo-publication';
import { pageMetadata, SITE_URL } from './page-metadata';

type LocalizedLocale = Exclude<Locale, 'en'>;

const copy: Record<LocalizedLocale, Record<PseoModifier, [string, string]>> = {
  fr: {
    'for-mac': ['sur Mac', 'Retrouvez l’outil et les informations pour utiliser cette conversion sur Mac.'],
    'for-windows': ['sur Windows', 'Retrouvez l’outil et les informations pour utiliser cette conversion sur Windows.'],
    'on-iphone': ['sur iPhone', 'Retrouvez l’outil et les informations pour utiliser cette conversion sur iPhone.'],
    'without-watermark': ['et filigranes', 'Consultez la page de conversion et ses informations sur les filigranes.'],
  },
  es: {
    'for-mac': ['en Mac', 'Consulta la herramienta y la información sobre esta conversión en Mac.'],
    'for-windows': ['en Windows', 'Consulta la herramienta y la información sobre esta conversión en Windows.'],
    'on-iphone': ['en iPhone', 'Consulta la herramienta y la información sobre esta conversión en iPhone.'],
    'without-watermark': ['y marcas de agua', 'Consulta la página de conversión y su información sobre marcas de agua.'],
  },
  de: {
    'for-mac': ['auf dem Mac', 'Hier finden Sie das Werkzeug und Informationen zur Konvertierung auf dem Mac.'],
    'for-windows': ['unter Windows', 'Hier finden Sie das Werkzeug und Informationen zur Konvertierung unter Windows.'],
    'on-iphone': ['auf dem iPhone', 'Hier finden Sie das Werkzeug und Informationen zur Konvertierung auf dem iPhone.'],
    'without-watermark': ['und Wasserzeichen', 'Hier finden Sie das Werkzeug und Hinweise zu Wasserzeichen.'],
  },
  ar: {
    'for-mac': ['على ماك', 'تعرّف على أداة التحويل وطريقة استخدامها على ماك.'],
    'for-windows': ['على ويندوز', 'تعرّف على أداة التحويل وطريقة استخدامها على ويندوز.'],
    'on-iphone': ['على آيفون', 'تعرّف على أداة التحويل وطريقة استخدامها على آيفون.'],
    'without-watermark': ['والعلامات المائية', 'اطّلع على أداة التحويل والمعلومات المتعلقة بالعلامات المائية.'],
  },
};

export function localizedPseoHeading(locale: LocalizedLocale, toolSlug: string, modifier: PseoModifier) {
  return `${DICTIONARIES[locale].tools[toolSlug].h1} ${copy[locale][modifier][0]}`;
}

export function localizedPseoMetadata(page: PseoPublication): Metadata {
  if (page.locale === 'en' || page.intent.kind !== 'platform') return {};
  const heading = localizedPseoHeading(page.locale, page.toolSlug, page.intent.modifier);
  return {
    ...pageMetadata(
      page.locale,
      heading + ' | PDFConverter',
      heading + '. ' + copy[page.locale][page.intent.modifier][1],
      SITE_URL + page.path,
      getPseoLanguageAlternates(page.path),
    ),
    robots: { index: true, follow: true },
  };
}

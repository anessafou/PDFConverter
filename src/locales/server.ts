import { headers } from 'next/headers';
import { SUPPORTED_LOCALES, type Locale } from '@/config/i18n-registry';
export async function requestLocale(): Promise<Locale> {
  const locale = (await headers()).get('x-pdfconverter-locale') as Locale;
  return SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
}

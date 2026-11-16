import type { Locale } from '@/config/i18n-registry';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { DICTIONARIES } from './dictionaries';
import uiCatalog from './ui-catalog.json';
const locales: Locale[] = ['en', 'fr', 'es', 'de', 'ar'];
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const catalogs = new Map<Locale, Map<string, string>>();
function catalog(locale: Locale) {
  let dictionary = catalogs.get(locale);
  if (dictionary) return dictionary;
  dictionary = new Map<string, string>();
  const position = locales.indexOf(locale);
  for (const row of uiCatalog) dictionary.set(normalize(row[0]), row[position] || row[0]);
  function addPairs(english: unknown, localized: unknown) {
    if (typeof english === 'string' && typeof localized === 'string') dictionary!.set(normalize(english), localized);
    else if (english && localized && typeof english === 'object' && typeof localized === 'object') {
      for (const key of Object.keys(english)) addPairs((english as Record<string, unknown>)[key], (localized as Record<string, unknown>)[key]);
    }
  }
  addPairs(DICTIONARIES.en.common, DICTIONARIES[locale].common);
  addPairs(DICTIONARIES.en.home, DICTIONARIES[locale].home);
  for (const tool of Object.values(TOOLS_REGISTRY)) {
    const copy = DICTIONARIES[locale].tools[tool.slug];
    dictionary.set(tool.name, copy.h1); dictionary.set(tool.description, copy.description);
    addPairs(DICTIONARIES.en.tools[tool.slug], copy);
  }
  catalogs.set(locale, dictionary);
  return dictionary;
}
function translateValue(locale: Locale, value: string, depth: number): string {
  if (locale === 'en') return value;
  const key = normalize(value);
  const dictionary = catalog(locale);
  let translated = dictionary.get(key);
  if (translated === undefined && depth < 3) {
    for (const [template, target] of dictionary) {
      if (!/\{\d+\}/.test(template)) continue;
      const pieces = template.split(/(\{\d+\})/);
      const pattern = pieces.map(piece => /^\{\d+\}$/.test(piece) ? '(.+?)' : piece.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')).join('');
      const matches = new RegExp('^' + pattern + '$').exec(key);
      if (!matches) continue;
      translated = target.replace(/\{(\d+)\}/g, (_placeholder, index: string) => translateValue(locale, matches[Number(index) + 1], depth + 1));
      break;
    }
  }
  if (translated === undefined) return value;
  return (value.match(/^\s*/)?.[0] || '') + translated + (value.match(/\s*$/)?.[0] || '');
}
export function translate(locale: Locale, value: string): string { return translateValue(locale, value, 0); }

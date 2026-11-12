import { SUPPORTED_LOCALES, getCanonicalSlugFromLocalized, getLocalizedSlug, type Locale } from '@/config/i18n-registry';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { getPublishedPseoCounterpart, resolvePublishedPseo } from '@/config/pseo-publication';
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return SUPPORTED_LOCALES.includes(first as Locale) ? first as Locale : 'en';
}
/** Keep existing localized slugs, pSEO modifiers, queries and anchors. */
export function localizePath(href: string, target: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//') || /^\/(?:api|_next|secretadmin2026here)(?:\/|$)/.test(href) || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) return href;
  const suffixAt = href.search(/[?#]/);
  const suffix = suffixAt < 0 ? '' : href.slice(suffixAt);
  const pathname = suffixAt < 0 ? href : href.slice(0, suffixAt);
  const current = localeFromPath(pathname);
  const segments = pathname.split('/').filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0] as Locale)) segments.shift();
  const prefix = target === 'en' ? '' : '/' + target;
  if (!segments.length) return (prefix || '/') + suffix;
  if (segments[0] === 'p' && segments.length === 2) {
    const sourcePath = (current === 'en' ? '' : '/' + current) + '/p/' + segments[1];
    const published = resolvePublishedPseo(current, segments[1]);
    const counterpart = getPublishedPseoCounterpart(sourcePath, target);
    if (counterpart) return counterpart.path + suffix;
    if (published) return prefix + '/' + getLocalizedSlug(published.toolSlug, target) + suffix;
    // Never invent a guide URL from a suffix. Unknown historical inputs remain unchanged.
    return href;
  }
  if (segments[0] === 'category') return prefix + '/' + segments.join('/') + suffix;
  const canonical = getCanonicalSlugFromLocalized(segments[0], current) || segments[0];
  if (!Object.hasOwn(TOOLS_REGISTRY, canonical) && !['contact', 'privacy', 'terms'].includes(canonical)) return href;
  return prefix + '/' + getLocalizedSlug(canonical, target) + suffix;
}

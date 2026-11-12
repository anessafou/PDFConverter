import baseline from './pseo-publication-baseline.json';
import { SUPPORTED_LOCALES, type Locale } from './i18n-registry';
import { PSEO_CONFIG, TOOLS_REGISTRY, type PseoModifier } from './tools-registry';
import { LOCALIZED_MODIFIERS, resolveLocalizedPseo } from './pseo-modifiers';
import { ENGLISH_INTENT_INDEX } from './english-pseo-index';
import reviews from './pseo-publication-reviews.json';

export type PseoIntent = { kind: 'platform'; modifier: PseoModifier } | { kind: 'task'; key: string };
export interface PseoCandidate { path: string; locale: Locale; toolSlug: string; intent: PseoIntent }
export interface PseoPublication extends PseoCandidate {
  existing: boolean;
  published: boolean;
  eligibleForNewPublication: boolean;
  reviewReasons: string[];
}

// These are observed implementation paths, not isClientReady marketing flags.
// Worker availability and browser-dependent decoding are deliberately not assumed.
const BROWSER_OPERATIONS = new Set([
  'pdf-to-base64', 'pdf-to-txt', 'pdf-to-markdown', 'pdf-to-json', 'pdf-to-xml', 'pdf-to-html',
  'pdf-to-png', 'pdf-to-jpg', 'pdf-to-webp', 'pdf-to-bmp', 'pdf-to-long-image',
  'docx-to-txt', 'docx-to-html', 'xlsx-to-csv', 'jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf',
  'svg-to-pdf', 'bmp-to-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf',
  'webp-to-png', 'png-to-webp', 'jpg-to-png', 'png-to-jpg', 'jpg-to-webp', 'webp-to-jpg',
  'bmp-to-jpg', 'svg-to-png', 'svg-to-jpg', 'ico-to-png',
]);
const CONDITIONAL_OPERATIONS = new Set(['heic-to-jpg', 'heic-to-png', 'png-to-avif', 'jpg-to-avif', 'avif-to-jpg', 'avif-to-png', 'tiff-to-jpg', 'tiff-to-png']);
export function getPseoToolCapability(toolSlug: string) {
  if (!Object.hasOwn(TOOLS_REGISTRY, toolSlug)) return 'unknown';
  if (BROWSER_OPERATIONS.has(toolSlug)) return 'browser-implemented';
  if (CONDITIONAL_OPERATIONS.has(toolSlug)) return 'browser-dependent';
  if (toolSlug === 'image-converter') return 'reviewed-image-workflows';
  return 'external-service-not-verified';
}

// Task keys are not constrained to the four legacy platform modifiers.
// Each operation must have its own implementation evidence and exact page approval.
const TASK_TOOLS: Record<string, string> = {
  'images-to-ico': 'image-converter', 'images-to-bmp': 'image-converter',
  'bmp-to-png': 'image-converter', 'svg-to-webp': 'image-converter',
  'batch-webp-conversion': 'image-converter', 'image-format-comparison': 'image-converter',
  'save-rotation': 'rotate-pdf',
};
const retained = new Set(baseline.paths);
const reviewed = new Map(reviews.map(review => [review.path, review]));

export function evaluatePseoCandidate(candidate: PseoCandidate): PseoPublication {
  const reasons: string[] = [];
  const review = reviewed.get(candidate.path);
  const toolExists = Object.hasOwn(TOOLS_REGISTRY, candidate.toolSlug);
  const validLocale = SUPPORTED_LOCALES.includes(candidate.locale);
  if (!toolExists) reasons.push('unknown-tool');
  if (!validLocale) reasons.push('unsupported-locale');
  const slug = candidate.intent.kind === 'task'
    ? candidate.toolSlug + '-' + candidate.intent.key
    : candidate.toolSlug + '-' + LOCALIZED_MODIFIERS[candidate.locale]?.[candidate.intent.modifier];
  const expectedPath = (candidate.locale === 'en' ? '' : '/' + candidate.locale) + '/p/' + slug;
  if (candidate.path !== expectedPath) reasons.push('path-does-not-match-intent');
  const capability = getPseoToolCapability(candidate.toolSlug);
  if (capability === 'external-service-not-verified' || capability === 'browser-dependent' || capability === 'unknown') reasons.push(capability);
  if (candidate.intent.kind === 'task') {
    if (candidate.locale !== 'en') reasons.push('task-template-unavailable-for-locale');
    if (!Object.hasOwn(TASK_TOOLS, candidate.intent.key) || TASK_TOOLS[candidate.intent.key] !== candidate.toolSlug) reasons.push('task-functionality-not-verified');
    if (review?.task !== candidate.intent.key || review?.toolSlug !== candidate.toolSlug) reasons.push('intent-relevance-not-reviewed');
  } else {
    // A historical allowlist is not evidence of device-specific value or a tested workflow.
    if (review?.task !== candidate.intent.modifier || review?.toolSlug !== candidate.toolSlug) reasons.push('legacy-modifier-relevance-needs-review');
    if (!review && (!Object.hasOwn(PSEO_CONFIG, candidate.toolSlug) || !PSEO_CONFIG[candidate.toolSlug].includes(candidate.intent.modifier))) reasons.push('outside-english-legacy-allowlist');
  }
  if (!review || review.locale !== candidate.locale || review.contentStatus !== 'reviewed' || !review.contentSha256 || !review.evidence.length) reasons.push('locale-content-not-reviewed');
  if (!review || review.approval !== 'approved-local-english-expansion-2026-11-10') reasons.push('explicit-publication-approval-missing');
  const existing = retained.has(candidate.path) && retainedIdentities.get(candidate.path) === candidate.locale + ':' + intentKey(candidate);
  const eligibleForNewPublication = reasons.length === 0;
  return { ...candidate, existing, eligibleForNewPublication, published: existing || eligibleForNewPublication, reviewReasons: reasons };
}

function describeRetainedPath(path: string): PseoCandidate {
  const locale = (path.startsWith('/p/') ? 'en' : path.split('/')[1]) as Locale;
  const slug = path.split('/').at(-1)!;
  const intent = ENGLISH_INTENT_INDEX.find(page => page.slug === slug && locale === 'en');
  if (intent) return { path, locale, toolSlug: intent.toolSlug, intent: { kind: 'task', key: slug.slice(intent.toolSlug.length + 1) } };
  const match = resolveLocalizedPseo(locale, slug);
  if (!match) throw new Error('Unrecognized retained pSEO path: ' + path);
  return { path, locale, toolSlug: match.canonicalToolSlug, intent: { kind: 'platform', modifier: match.modifier } };
}

const retainedCandidates = baseline.paths.map(describeRetainedPath);
const retainedIdentities = new Map(retainedCandidates.map(page => [page.path, page.locale + ':' + intentKey(page)]));
const candidates: PseoCandidate[] = [
  ...retainedCandidates,
  // An index entry alone never authorizes publication: all evidence gates must pass.
  ...ENGLISH_INTENT_INDEX.map(page => ({ path: '/p/' + page.slug, locale: 'en' as const, toolSlug: page.toolSlug, intent: { kind: 'task' as const, key: page.slug.slice(page.toolSlug.length + 1) } })),
];
const records = new Map(candidates.map(candidate => [candidate.path, evaluatePseoCandidate(candidate)]));

export function getPublishedPseoPages(locale?: Locale): PseoPublication[] {
  return [...records.values()].filter(page => page.published && (!locale || page.locale === locale));
}
export function getPublishedPseoPage(path: string): PseoPublication | null {
  const page = records.get(path);
  return page?.published ? page : null;
}
export function resolvePublishedPseo(locale: Locale, slug: string) {
  return getPublishedPseoPage((locale === 'en' ? '' : '/' + locale) + '/p/' + slug);
}
function intentKey(page: PseoCandidate) {
  return page.toolSlug + ':' + page.intent.kind + ':' + (page.intent.kind === 'task' ? page.intent.key : page.intent.modifier);
}
export function getPublishedPseoCounterpart(path: string, locale: Locale) {
  const page = getPublishedPseoPage(path);
  return page ? getPublishedPseoPages(locale).find(other => intentKey(other) === intentKey(page)) ?? null : null;
}
export function getPseoLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const counterpart = getPublishedPseoCounterpart(path, locale);
    if (counterpart) languages[locale] = 'https://www.pdfconverter.space' + counterpart.path;
  }
  return languages;
}
export function getPublishedPlatformModifiers(toolSlug: string, locale: Locale = 'en'): PseoModifier[] {
  return getPublishedPseoPages(locale).filter(page => page.toolSlug === toolSlug && page.intent.kind === 'platform').map(page => (page.intent as { kind: 'platform'; modifier: PseoModifier }).modifier);
}

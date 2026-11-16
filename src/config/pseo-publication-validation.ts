// Build/test-only validation. Do not import this Node module into client routing.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import reviews from './pseo-publication-reviews.json';
import { getEnglishIntentPage, type EnglishIntentPage } from './english-pseo-content';
import { getPublishedPseoPages } from './pseo-publication';

const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export function validateReviewedPseoContent(page: EnglishIntentPage | null, approvedHash: string): boolean {
  if (!page || !page.title.trim() || !page.description.trim() || !page.h1.trim() || !page.intro.trim()) return false;
  if (page.steps.length < 3 || page.sections.length < 2 || page.faqs.length < 4) return false;
  if (!page.steps.every(step => step.title.trim() && step.text.trim())) return false;
  if (!page.sections.every(section => section.heading.trim() && section.paragraphs.length && section.paragraphs.every(p => p.trim()))) return false;
  if (!page.faqs.every(faq => faq.q.trim() && faq.a.trim())) return false;
  return hash(JSON.stringify(page)) === approvedHash;
}
export function validatePseoPublicationEvidence(projectRoot = process.cwd()): void {
  for (const page of getPublishedPseoPages().filter(page => page.intent.kind === 'task' || page.eligibleForNewPublication)) {
    const review = reviews.find(review => review.path === page.path);
    if (!review || !validateReviewedPseoContent(getEnglishIntentPage(page.path.split('/').at(-1)!), review.contentSha256)) {
      throw new Error('pSEO content missing, incomplete or changed since approval: ' + page.path);
    }
    for (const implementation of review.implementationFiles) {
      if (hash(readFileSync(resolve(projectRoot, implementation.file))) !== implementation.sha256) {
        throw new Error('pSEO implementation changed; revalidate capability evidence: ' + page.path);
      }
    }
  }
}

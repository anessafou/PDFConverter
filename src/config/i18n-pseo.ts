// Compatibility facade: publication inventory now has one owner.
export { LOCALIZED_MODIFIERS, resolveLocalizedPseo } from './pseo-modifiers';
import { getPublishedPseoPages } from './pseo-publication';
export function getAllPseoPaths(): string[] {
  return getPublishedPseoPages().map(page => page.path);
}

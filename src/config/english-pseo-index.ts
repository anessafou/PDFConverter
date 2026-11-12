// English-only intent pages. Legacy platform URLs remain in PSEO_CONFIG.
// Keep this small: shared routing imports it in client components.
export const ENGLISH_INTENT_INDEX = [
  { slug: 'image-converter-images-to-ico', toolSlug: 'image-converter', label: 'Create ICO files from PNG or JPG', relatedTools: ['ico-to-png'] },
  { slug: 'image-converter-images-to-bmp', toolSlug: 'image-converter', label: 'Convert images to 24-bit BMP', relatedTools: ['bmp-to-jpg'] },
  { slug: 'image-converter-bmp-to-png', toolSlug: 'image-converter', label: 'Convert BMP images to PNG', relatedTools: ['bmp-to-jpg'] },
  { slug: 'image-converter-svg-to-webp', toolSlug: 'image-converter', label: 'Rasterize SVG artwork as WebP', relatedTools: ['svg-to-png', 'svg-to-jpg', 'png-to-webp'] },
  { slug: 'image-converter-batch-webp-conversion', toolSlug: 'image-converter', label: 'Batch WebP to PNG or JPG', relatedTools: ['webp-to-png', 'webp-to-jpg'] },
  { slug: 'image-converter-image-format-comparison', toolSlug: 'image-converter', label: 'Choose between PNG, JPG and WebP', relatedTools: ['png-to-jpg', 'png-to-webp', 'jpg-to-webp', 'webp-to-png'] },
  { slug: 'rotate-pdf-save-rotation', toolSlug: 'rotate-pdf', label: 'Rotate a PDF and save its orientation', relatedTools: [] },
] as const;

export type EnglishIntentSlug = typeof ENGLISH_INTENT_INDEX[number]['slug'];
export function findEnglishIntent(slug: string) {
  return ENGLISH_INTENT_INDEX.find(page => page.slug === slug);
}
export function getEnglishIntentSlugs(): string[] {
  return ENGLISH_INTENT_INDEX.map(page => page.slug);
}
export function getEnglishGuidesForTool(toolSlug: string) {
  return ENGLISH_INTENT_INDEX.filter(page => page.toolSlug === toolSlug || (page.relatedTools as readonly string[]).includes(toolSlug));
}

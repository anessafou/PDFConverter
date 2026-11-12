# Multilingual repair

The original selector changed the URL, but most rendered text was hard-coded in English. Dictionaries covered only two tools; shared widgets did not receive the locale; localized utility URLs opened the generic converter; and navigation often returned to unprefixed English routes.

## Changes

- Reused DICTIONARIES and completed titles, descriptions and FAQs for all 86 tools in French, Spanish, German and Arabic.
- Added a shared UI catalog for navigation, homepage, controls, reviews, validation messages, document viewer, image converter, Markdown editor, contact and legal pages.
- Connected components through explicit translation calls and a shared LocaleProvider. User documents, filenames and review content are preserved.
- Added shared URL localization that preserves existing translated slugs, pSEO modifiers, query strings and anchors. The locale cookie restores language for unprefixed navigation; an explicit locale URL wins.
- Restored the dedicated image converter, document viewer and Markdown editor on their localized routes, and added localized category/support routes.
- Localized metadata, canonical and alternate links, breadcrumbs and structured data. Production HTML carries the correct lang and dir attributes.
- Enabled Arabic RTL for the document and existing text alignment, with RTL-aware review carousel navigation.
- Preserved existing styling classes, converter engine, API routes and database implementation. No additional database migration is needed for this language fix.

## Maintain translations

Existing editorial translations remain in src/locales/dictionaries.ts. Service descriptions are in src/locales/tool-descriptions.json. Shared UI strings are in src/locales/ui-catalog.json; each row is English, French, Spanish, German, Arabic. Keep filenames and machine-facing format identifiers unchanged.

## Verification

- 14 regression tests passed, including six new multilingual tests and the existing conversion/PostgreSQL tests.
- 430 service/language URLs passed (86 tools x five languages).
- Real Chrome checks passed for all five languages: selector, homepage, tool navigation, refresh, locale cookie, metadata, dedicated utilities, pSEO switching and actual Base64 downloads.
- Production build and TypeScript validation passed.
- Production-mode localized pSEO requests returned correct HTML lang and dir for FR, ES, DE and AR.
- Visual checks covered Arabic desktop/mobile layout and the German heading. Arabic carousel navigation, preserved user content, language switching, and absence of horizontal overflow also passed.

The GitHub repository, Vercel deployment and live Neon database were not accessed or changed.

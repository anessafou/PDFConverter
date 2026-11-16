# PDFConverter — repaired project

## Install and run

Use Node.js 22.13 or newer. Run npm ci, then npm run dev. For production run npm run quality-gate and npm start. The install/build hooks copy the matching PDF.js worker into public/vendor.

Copy `.env.example` to `.env.local` for local configuration. Set `NEXT_PUBLIC_BASE_URL` to the public origin used for canonical URLs. Keep `DATABASE_URL`, `ADMIN_SECRET_KEY`, and `CONVERSION_WORKER_TOKEN` server-only; never add the `NEXT_PUBLIC_` prefix to them.

## Deploy to Vercel

1. Import this project directory or its GitHub repository into Vercel and select the Next.js framework preset. Use Node.js 22.x in the project settings.
2. Add the environment variables from `.env.example` in Vercel Project Settings → Environment Variables. Set `NEXT_PUBLIC_BASE_URL` to the production origin. Add `DATABASE_URL` only when a PostgreSQL review database is configured, set `ADMIN_SECRET_KEY` to a random value of at least 32 characters, and set `CONVERSION_WORKER_URL` plus the optional `CONVERSION_WORKER_TOKEN` only when a compatible conversion worker is available.
3. Apply the review database schema using the instructions below before enabling review submission. Review reads fail safely when the database is unavailable; submissions cannot be saved without it.
4. Deploy a Preview first. Run the checks in the Verification section against the Preview URL, then promote it to Production through Vercel when you are ready. Configure the production domain in Vercel and set `NEXT_PUBLIC_BASE_URL` to that same canonical origin.

Vercel deployment itself does not provide the external conversion engine. Worker-backed conversions require a separately deployed service that implements the contract below. Do not put secrets in source files, client code, or build-time public variables.

## Connect your existing Neon reviews database

1. In your existing Neon project, open SQL Editor and run scripts/migrate-reviews.sql. This adds helpful_count and preserves existing rows. It is safe to run more than once. For a new database, run scripts/schema-postgres.sql instead.
2. Put the pooled connection string from Neon Connect in DATABASE_URL in .env.local for local use and in your hosting environment for deployment. Preserve its TLS settings. Do not put the connection string into client-side variables or commit it.
3. Set ADMIN_SECRET_KEY to a long random secret. Use /secretadmin2026here/login to sign in.
4. Restart or redeploy the app after updating environment variables. Reviews, moderation, deletion, filters, statistics, rate limits and helpful votes now use PostgreSQL consistently.

No live Neon database was accessed or changed while making these fixes. The screenshot supplies the database type/table names, not a connection string.

Configured database failures are reported instead of falling back to process memory. Development without DATABASE_URL uses a local .data/reviews.json file. Production requires DATABASE_URL; local JSON is not a production failover.

## Conversion behavior

Real browser implementations: Base64; PDF to extracted TXT/Markdown/JSON/XML/HTML; PDF to PNG/JPG/WebP/BMP and long PNG; DOCX to TXT/HTML; XLSX to CSV; browser-decodable image conversions to PNG/JPG/WebP/AVIF/BMP; JPG/PNG/WebP/SVG to PDF; PDF merge, split and rotate.

Multi-page PDF image extraction and split PDF download ZIP files. Multi-sheet XLSX extraction downloads a ZIP of CSV files. Merge accepts multiple PDFs; rotate turns every page 90 degrees clockwise. Browser image-format support varies and unsupported encoding reports an error rather than relabeling PNG bytes.

PDF text extraction reads embedded text; scanned PDFs require OCR. Markdown output contains extracted text without attempting to reconstruct the source layout. Browser GIF-to-WebP is not used for animation, to avoid silently discarding frames.

Other operations, including PDF to Word/Excel/PPT, PDF table extraction, OCR, compression, specialist formats and unsupported image encoders, need an actual external conversion worker. This project contains the validated adapter, not that external engine. Unsupported/unconfigured services report errors and never return simulated files.

## Optional conversion worker contract

Set CONVERSION_WORKER_URL to the base URL of your worker (for example https://your-worker.example). The app POSTs multipart form data to BASE_URL/convert with file, toolSlug and targetFormat. targetFormat is chosen from the server registry, not trusted from the caller. Optionally set CONVERSION_WORKER_TOKEN; the app sends it as a Bearer token only to the configured worker.

The worker must perform the requested operation, return a non-empty binary file with HTTP 200, and return a non-2xx status for failures. Input is limited to 25 MB, output to 100 MB, and the request times out after 120 seconds. Common output signatures are validated; raw inputs relabeled with another extension are rejected. Signature checks are an additional check, not a substitute for a correct worker.

## Verification

- npm test: conversion regression tests and PostgreSQL behavior using PGlite (an embedded PostgreSQL engine).
- npm run test:browser: Chrome browser checks for extraction, rendering, output headers, image queue lifetimes, and worker responses. Chrome must be installed. Tests start a local dev server and a mock conversion worker.
- npm run quality-gate: TypeScript validation and production build.
- npm audit: dependency audit.

Tests use synthetic documents and local storage/database instances. Live Neon connectivity and an actual external conversion worker require deployment-specific validation.

## Multilingual interface

English, French, Spanish, German and Arabic are supported across the homepage and all services. Language selection is preserved in links and a preference cookie. Arabic uses RTL. See MULTILINGUAL.md for details and verification.

# QA Results

Run in the local `codex/cumulative-master-integration` branch. No test result below is inferred from a previous project copy.

| Check | Command / method | Result |
|---|---|---|
| Latest GitHub base | `git fetch origin main`; `git rev-parse origin/main`; `git ls-remote origin refs/heads/main` | Exit 0; current SHA remained `9078994273f4471e4b08acd1cb5992477ab46aca`. |
| Clean dependencies | `npm ci` | Exit 0; 332 packages installed; 0 reported vulnerabilities. |
| TypeScript | `npm run typecheck` | Exit 0. |
| Unit suite | `npm test` | Exit 0; 40 tests passed, 0 failed. Includes conversion unit cases, publication inventory, hreflang, review outage behavior, and new Merge-order assertions. |
| Production build | `npm run build` with temporary `distDir: '.next-integration'` solely to isolate Next-generated output | Exit 0; generated 1,426 routes. Edge-runtime static-generation warning remains limited to the Open Graph image route. The temporary config change and Next-generated `tsconfig.json` include were restored after the build. |
| Relevant SEO/localization Playwright | `PLAYWRIGHT_PRODUCTION=1 npx playwright test tests/browser/english-core-tool-content.spec.ts tests/browser/english-pseo.spec.ts tests/browser/localized-pseo-editorial.spec.ts tests/browser/pseo-metadata.spec.ts tests/browser/pseo-navigation.spec.ts tests/browser/pseo-publication.spec.ts tests/browser/pseo-redirects.spec.ts tests/browser/tool-content.spec.ts --reporter=line` | Exit 0; 24 passed, 0 failed. Covers the five locales, language switching, localized RTL, page content, canonical/hreflang, route publication, sitemap membership, and Merge PDF order wording. |
| Route/tool inventory | `tsx` execution of active `TOOLS_REGISTRY` and `getAllPseoPaths()` | 86 tools; 1,406 unique pSEO URLs (EN 78, FR/DE/ES/AR 332 each). No duplicate route path. |
| Full local sitemap crawl | Node fetch script against built local server | Exit 0; index and all three children returned 200; child counts 463/1,000/406; 1,869 unique sitemap URLs. All 1,869 returned HTTP 200 and each SSR canonical exactly matched its sitemap URL. All 1,406 pSEO routes were present and crawled. |
| Client/direct canonical | `pseo-navigation.spec.ts` in the 24-test suite | Passed for all supported locales after localized heading/target-canonical synchronization, then direct-loaded the category and verified one self-canonical. |

## Non-passing/incomplete browser attempts

- Full `npx playwright test --reporter=line` against a manually reused production server: **exit 1**, 27 passed / 1 failed of 28. The lone `conversion.spec.ts` worker-proxy test expected 502 but got 503 because that manually started Next server had no `CONVERSION_WORKER_URL`; Playwright’s configured worker fixture was not inherited by a reused server. This was a test-server environment mismatch, not a verified converter defect.
- Re-running the isolated worker-proxy browser test with Playwright-managed server configuration did not produce a completion summary in this shell session. It was interrupted; **exit 1, incomplete**. Do not count it as passed.
- Standard `npm run build` retries against the already-used `.next` directory hit intermittent `EPERM` while creating Next output paths; later the incomplete directory could not start. A clean isolated-output production build then passed with all 1,426 routes. The application Next config was restored afterward.

## Sitemap crawl detail

The successful crawl parsed all child sitemap `<loc>` values (including the homepage URL without a trailing slash), confirmed 1,869 unique URLs, fetched each URL from the local production server, and compared the emitted canonical link with the exact sitemap URL. There were zero status or canonical mismatches.

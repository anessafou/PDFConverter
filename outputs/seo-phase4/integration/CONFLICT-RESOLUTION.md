# Conflict Resolution

## What “conflict” means here

The cumulative master has no Git metadata or common-base commit. Therefore a three-way Git merge and a verified list of true merge conflicts cannot be produced. The raw SHA-256 comparison marks 68 same-path files as different; Git's normalized diff shows 50 effective modifications, while 18 paths normalize unchanged due to line-ending differences. These 50 were treated as potential conflicts. For this integration, the cumulative master was selected as the intended source for those paths, while the branch remained based on the latest GitHub commit.

## Reviewed sensitive areas

- **Tool registry:** both active registries have the same 86 tool slugs. No tool existed only on one side.
- **pSEO routes:** the current GitHub set (1,399) is a subset of the master set (1,406). All seven master-only English pages are preserved. No GitHub URL was removed.
- **GitHub-only config:** kept `src/config/tools.config.ts` unchanged. Repository searches found no code/script import; it contains two legacy definitions and is not the active registry. It remains present pending maintainer confirmation.
- **Environment names:** retained the master’s `CONVERSION_WORKER_TOKEN` support alongside the shared `NEXT_PUBLIC_BASE_URL`, `ADMIN_SECRET_KEY`, `DATABASE_URL`, and `CONVERSION_WORKER_URL` names. No values/secrets were copied or disclosed.
- **Build/runtime config:** retained the master Next, package, lockfile, middleware, scripts, and route changes. Temporary build output/config changes were restored; hashes of `next.config.mjs` and `tsconfig.json` were compared to the master copies.
- **APIs/converters/reviews:** transferred the master API/engine/repository implementations; no conversion behavior was edited for the Merge-order copy correction.
- **Localization/SEO:** transferred the single publication policy and master sitemap, metadata, canonical/hreflang, locale routing, and RTL implementation. No alternate eligibility policy was added.

## Conflict outcome

- 62 master additions transferred.
- 68 paths differed in raw SHA-256; 50 are effective Git modifications and 18 normalize unchanged.
- One master-deleted path (`src/config/tools.config.ts`) was retained from GitHub.
- Nine paths were byte-identical in the raw checklist; including the 18 normalized paths, 27 shared paths are effectively unchanged.
- A new, focused Merge PDF content test was added after the transfer checklist.

Because the master is gitless, file-hash alignment establishes what was transferred but cannot prove historical intent for every same-path edit. The full path/hash evidence remains in the comparison CSV.

# Repair notes

- Replaced server pass-through and fake downloads with a bounded, validated conversion-worker adapter and explicit failure responses.
- Added real parsers/renderers for the supported browser conversion operations; Base64 dispatch now precedes generic conversion.
- Added real BMP encoding and corrected the existing bulk converter BMP signature.
- Fixed retained image URLs being revoked on queue changes and prevented queue edits during a conversion.
- Fixed conversion progress timers and result URL ownership; added file validation and multi-file PDF merge input.
- Implemented PostgreSQL admin listing, moderation, deletion, helpful votes, star filters, sorting, and consistent aggregates.
- Removed database-to-memory failover; database failures propagate and rate limiting no longer silently disables itself.
- Added an idempotent helpful_count migration for existing Neon tables.
- Fixed review order being overridden by keyword relevance in the client and validated filter query parameters.
- Added visible admin errors and invalidated review page caches after moderation/deletion.
- Made review-backed pages dynamic so builds do not require live review queries.
- Added regression/browser tests, locked parser dependencies, and resolved npm audit findings in the tested dependency tree.

See README.md for deployment instructions, supported conversions, and the optional worker contract.

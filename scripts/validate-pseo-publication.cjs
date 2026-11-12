// Run by prebuild so stale content/capability approvals cannot silently ship.
require('tsx/cjs');
require('../src/config/pseo-publication-validation.ts').validatePseoPublicationEvidence();
console.log('pSEO publication evidence validated.');

# FORGE

FORGE is a Tampermonkey-based NetSuite companion drawer for consultant-led demo creation. It classifies a prospect from website evidence and consultant notes, submits a governed NetSuite runner through an approved adapter, waits for completed runner output, imports verified record names and Open links, and gives the consultant concise Review/Run guidance.

## Repository Contents

- `idb-drawer.user.js` - Tampermonkey drawer userscript.
- `assets/FORGE.png` - FORGE brand mark used by the drawer header.
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js` - approved governed runner adapter Suitelet.
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js` - governed DCC runner script used to create demo records.
- `tools/` - regression harnesses and validation utilities.
- `data/`, `reports/`, `trace_samples/` - contract fixtures, reports, and sanitized trace samples.
- `docs/` - historical plans, upload manifests, and implementation notes.

For continuity with the existing project validator, this public package keeps the historical planning documents `PRODUCTIZED_CREATION_AND_CONSULTANT_UX_ARCHITECTURE.md` and `VISUAL_VALUE_AND_ENRICHED_PREVIEW_ARCHITECTURE.md`. Those plans include the Seven authorized V5 lanes and Prompt M12-M16 design history.

## Public Scrub

This package was prepared for a public repository. Sandbox account hostnames, local filesystem paths, operator names, and scheduled runner task IDs have been replaced with placeholders. Configure your own NetSuite account, Suitelet deployment, script IDs, folder IDs, subsidiary, location, and saved search IDs in NetSuite/admin setup before live use.

## Quick Local Validation

```bash
npm run check
npm run validate
npm run harness:food-batch-completed-import-guard-w237
```

## Install Summary

1. Install or update `idb-drawer.user.js` in Tampermonkey.
2. Upload/deploy `netsuite/idb_governed_runner_adapter_w144_suitelet.js` as the approved adapter.
3. Upload/deploy `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js` as the governed runner.
4. Configure the drawer admin/debug setup with your account-specific Suitelet URL and NetSuite script parameters.

FORGE preserves the no-drawer-write boundary: the drawer does not create records, does not write transactions, and does not invoke SuiteScript outside the approved adapter path. The governed runner owns generated records.

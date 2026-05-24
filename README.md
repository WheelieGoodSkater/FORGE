# FORGE

FORGE is a Tampermonkey-based NetSuite companion drawer for consultant-led demo creation. It classifies a prospect from website evidence and consultant notes, submits a governed NetSuite runner through an approved adapter, waits for completed runner output, imports verified record names and Open links, and gives the consultant concise Review/Run guidance.

## What You Need

The active install/runtime surface is intentionally small:

- `idb-drawer.user.js` - Tampermonkey drawer userscript.
- `assets/` - FORGE brand assets used by the drawer.
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js` - approved governed runner adapter Suitelet.
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js` - governed DCC runner script used to create demo records.
- `src/contracts/` - runtime contract modules used by the drawer and compatibility checks.
- `INSTALL.md` - install and deployment notes.

Everything else from the build history, validation trail, old plans, upload manifests, hosted resolver experiments, reports, traces, and harnesses lives in `archive/`.

## Quick Validation

```bash
npm run check
```

This checks the active userscript, NetSuite scripts, and contract modules for JavaScript syntax errors.

## Install Summary

1. Install or update `idb-drawer.user.js` in Tampermonkey.
2. Upload/deploy `netsuite/idb_governed_runner_adapter_w144_suitelet.js` as the approved adapter.
3. Upload/deploy `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js` as the governed runner.
4. Configure the drawer admin/debug setup with your account-specific Suitelet URL and NetSuite script parameters.

FORGE preserves the no-drawer-write boundary: the drawer does not create records, does not write transactions, and does not invoke SuiteScript outside the approved adapter path. The governed runner owns generated records.

## Public Scrub

This package was prepared for a public repository. Sandbox account hostnames, local filesystem paths, operator names, and scheduled runner task IDs have been replaced with placeholders. Configure your own NetSuite account, Suitelet deployment, script IDs, folder IDs, subsidiary, location, and saved search IDs in NetSuite/admin setup before live use.

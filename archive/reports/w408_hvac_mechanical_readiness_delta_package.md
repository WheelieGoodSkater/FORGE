# W408: HVAC/Mechanical Readiness Delta Package

Date: 2026-06-03

Use W407 HVAC/Mechanical Source-Pack Readiness Cleanup as the locked source-pack baseline. Keep W406, W405, W404, W403, W397, W389, W388, W386, and W379-W383 locked.

## Summary

W408 creates the HVAC/Mechanical readiness delta package. No live smoke in W408. No upload or deployment was performed. No runtime upload package creation occurred.

The package is readiness evidence only. It is not runtime code and is not an upload/deployment artifact.

## Package Outputs

- Directory: `archive/package_ready/w408_hvac_mechanical_readiness_delta/`
- Zip: `archive/package_ready/w408_hvac_mechanical_readiness_delta.zip`
- Manifest: `archive/package_ready/w408_hvac_mechanical_readiness_delta/PACKAGE_MANIFEST_W408.md`
- File list: `archive/package_ready/w408_hvac_mechanical_readiness_delta/PACKAGE_FILE_LIST_W408.txt`
- Verification report: `archive/package_ready/w408_hvac_mechanical_readiness_delta/PACKAGE_VERIFICATION_REPORT_W408.md`
- Harness: `archive/tools/run_w408_hvac_mechanical_readiness_delta_package_harness.js`

## Included Files

- `src/contracts/lanePacks.js`
- `package.json`
- `archive/reports/w404_hvac_mechanical_fixture_first_selection.md`
- `archive/tools/run_w404_hvac_mechanical_fixture_first_selection_harness.js`
- `archive/reports/w405_hvac_mechanical_fixture_story_proof.md`
- `archive/tools/run_w405_hvac_mechanical_fixture_story_proof_harness.js`
- `archive/reports/w406_hvac_mechanical_second_fixture_decision.md`
- `archive/tools/run_w406_hvac_mechanical_second_fixture_decision_harness.js`
- `archive/reports/w407_hvac_mechanical_source_pack_cleanup.md`
- `archive/tools/run_w407_hvac_mechanical_source_pack_cleanup_harness.js`
- W408 package metadata files.

## Excluded File Policy

The package excludes live trace dumps, upload/deployment artifacts, runtime upload package files, unnecessary historical reports, screenshots, media files, `.env`, secrets, local cache, Downloads files, nested package contents, and nested zip files.

W386, W397, and W403 packages were not mutated.

## Boundary Preservation

- No live smoke in W408.
- No upload or deployment.
- No runtime upload package creation.
- No source-pack mutation in W408.
- No runner, adapter, record creation, import validation, or Open-link authority changes.
- No fake Open links.
- completed-result import validation was not changed.
- N/LLM remains advisory-only.
- Open-link authority remains verified-import-only.
- W408 no-regression gates passed.

## Validation Commands

```bash
node --check archive/tools/run_w408_hvac_mechanical_readiness_delta_package_harness.js
npm run harness:hvac-mechanical-readiness-delta-package-w408
npm run harness:hvac-mechanical-source-pack-cleanup-w407
npm run harness:hvac-mechanical-second-fixture-decision-w406
npm run harness:hvac-mechanical-fixture-story-proof-w405
npm run harness:hvac-mechanical-fixture-first-selection-w404
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
node --check archive/tools/run_w408_hvac_mechanical_readiness_delta_package_harness.js: passed
W408 HVAC/Mechanical readiness delta package harness: 13/13 passed
W407 HVAC/Mechanical source-pack cleanup harness: 16/16 passed
W406 HVAC/Mechanical second fixture decision harness: 19/19 passed
W405 HVAC/Mechanical fixture story proof harness: 15/15 passed
W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W408 package directory and zip exist | Pass | W408 package outputs exist. |
| Required files present | Pass | Expected file set is present. |
| Package contents expected only | Pass | No extra files. |
| Package file list matches directory | Pass | Inventory matches `PACKAGE_FILE_LIST_W408.txt`. |
| No disallowed package files | Pass | No traces, zips, secrets, media, Downloads, upload/deploy files, runner files, or nested package contents. |
| Zip list matches package file list | Pass | Zip entries match inventory. |
| Manifest and verification scope | Pass | Package states readiness evidence only. |
| Packaged HVAC source valid | Pass | Packaged source pack validates and resolves Horizon evidence. |
| Baseline reports preserved | Pass | W404-W407 pass counts preserved. |
| W403/W397/W386 packages untouched | Pass | W403, W397, and W386 packages remain separate. |
| Readiness-evidence-only boundary | Pass | No smoke/upload/runtime package. |
| No-regression gates | Pass | W408 no-regression gates passed. |

## Recommendation

Lock W408 HVAC/Mechanical readiness delta package and resume fixture-first expansion.

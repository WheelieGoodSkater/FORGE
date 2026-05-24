# W209 Upload Manifest

## Upload Files

1. Tampermonkey drawer:
   - `idb-drawer.user.js`

2. Active NetSuite scheduled runner:
   - `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
   - Upload this over the active `Demo Command Center Runner V3` scheduled script file.

## Do Not Upload For W209

- Do not replace the W144 Suitelet adapter if the W208 path is already deployed and working.
- Do not add a normal consultant-facing endpoint, flag, operator phrase, runner task, or result JSON field.

## Runner Image Lookup

- Image enrichment is disabled by default in the runner.
- Leave `custscript_v3_runner_enable_image_enrichment` absent or false.
- Leave `custscript_idb_enable_image_enrichment` absent or false.
- Record creation, Sales Order creation, item creation, CSV/import flow, and result capture must not depend on image lookup.

## Expected Consultant Flow

- Customer / Prospect Name
- Website
- Conversation Notes
- Create new item
- Manufacturing
- WIP
- Build demo records
- Check status only after the runner starts
- Finish build only after the completed result is ready
- Run demo and Open links only after imported real URLs exist

## Validation

- `npm run harness:production-flow-hardening-w209`
- `npm run harness:one-click-production-build-automation-w208`
- `npm run harness:production-consultant-build-automation-w206`
- `npm run harness:production-build-mode-smoke-w207`
- `npm run check`
- `npm run validate`

# W219 Upload Manifest

## Scope
- Work block: W219 Mode-Aware Import Failure Recovery Copy.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_mode_aware_import_failure_recovery_copy_w219_harness.js`.
- Report: `reports/w219_mode_aware_import_failure_recovery_copy.md`.
- Trace: `trace_samples/w219_mode_aware_import_failure_recovery_copy_trace.json`.
- Data artifact: `data/w219_mode_aware_import_failure_recovery_copy.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W219.
- No image lookup enablement is included.

## Consultant Recovery Copy
- Handoff JSON or blank/invalid import: `Paste the completed build result.` / `Use the latest completed runner result.`
- Invalid role/name combination: `This result does not match the selected operating mode.` / `Use the latest completed runner result.`
- Missing numeric ids, unsupported URLs, or non-openable returned records: `Ask the runner to return real NetSuite links.` / `Use available records only after import succeeds.`

## Admin/Debug Detail
- Admin/debug may show validation status, rejected roles, rejected names, missing ids, unsupported URLs, resolved operating mode, selected toggles, and mapped W214/W215 roles.
- Normal consultant UI hides W144 endpoint, runnerTaskId, raw JSON, W151 language, semantic guard/mode contract wording, internal role arrays, and stack traces.

## Preserved Boundaries
- W151 import guard remains active.
- W214 operating-mode resolver remains authoritative.
- W215 semantic runner role mapping remains authoritative.
- W216 consultant-facing partial result copy remains authoritative.
- W217 operator-readable smoke packet remains available.
- W218 frozen Review/Run wording remains preserved.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Validation
- `npm run harness:import-failure-recovery-copy-w219` -> PASS 11/11.
- `npm run harness:operator-smoke-wording-freeze-w218` -> PASS 10/10.
- `npm run harness:mode-aware-live-review-smoke-w217` -> PASS 9/9.
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W219.
- Recovery copy and admin/debug separation are covered by harness assertions.

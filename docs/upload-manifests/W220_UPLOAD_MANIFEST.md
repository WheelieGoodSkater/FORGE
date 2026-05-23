# W220 Upload Manifest

## Scope
- Work block: W220 Import Recovery UI Surface Wiring.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_import_recovery_ui_surface_wiring_w220_harness.js`.
- Report: `reports/w220_import_recovery_ui_surface_wiring.md`.
- Trace: `trace_samples/w220_import_recovery_ui_surface_wiring_trace.json`.
- Data artifact: `data/w220_import_recovery_ui_surface_wiring.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W220.
- No image lookup enablement is included.

## UI Wiring
- Review and Build import-failure surfaces now render W219 plain recovery copy.
- Normal consultant UI shows recovery headline, recovery next action, and no fake Open links.
- Admin/debug UI may show validation status, rejected roles, rejected names, missing ids, unsupported URLs, resolved operating mode, selected toggles, and mapped W214/W215 roles.

## Preserved Success Wording
- Complete non-manufacturing: `Build results are ready.`
- Complete manufacturing: `Build results are ready.`
- Partial food batch/WIP: `Food batch records are ready. WIP detail was not returned.`
- W218 frozen Run actions and labels remain preserved.

## Preserved Boundaries
- W151 import guard remains active.
- W214 operating-mode resolver remains authoritative.
- W215 semantic runner role mapping remains authoritative.
- W216 consultant-facing partial result copy remains authoritative.
- W217 operator-readable smoke packet remains available.
- W218 frozen Review/Run wording remains preserved.
- W219 import failure recovery copy remains preserved.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Validation
- `npm run harness:import-recovery-ui-wiring-w220` -> PASS 10/10.
- `npm run harness:import-failure-recovery-copy-w219` -> PASS 11/11.
- `npm run harness:operator-smoke-wording-freeze-w218` -> PASS 10/10.
- `npm run harness:mode-aware-live-review-smoke-w217` -> PASS 9/9.
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W220.
- Rendered Review/Build recovery surfaces are covered by harness assertions.

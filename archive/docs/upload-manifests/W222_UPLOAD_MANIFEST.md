# W222 Upload Manifest - Live Operator Packet Export And Copy Freeze

## Scope

W222 adds an exportable, copy-frozen operator summary for the W221 end-to-end import packet. The summary covers complete, partial, and recovery import paths without exposing internal diagnostics in normal consultant copy.

## Primary Update

- `idb-drawer.user.js`
  - Adds `exportableOperatorSummaryW222V1`.
  - Exports the W222 helper through `__IDB_TEST_HOOKS__`.
  - Preserves W218 frozen success wording and W220 recovery surfaces.

## W222 Artifacts

- `tools/run_live_operator_packet_export_copy_freeze_w222_harness.js`
- `data/w222_live_operator_packet_export_copy_freeze.json`
- `trace_samples/w222_live_operator_packet_export_copy_freeze_trace.json`
- `reports/w222_live_operator_packet_export_copy_freeze.md`

## Export Summary Coverage

- Ready cases: 2
- Partial cases: 1
- Recovery cases: 4
- Normal export hides forbidden internal terms.
- Admin/debug diagnostics appendix appears only when admin/debug export is explicitly requested.
- Recovery rows export `No Open links yet`.
- Valid import rows expose only real Open-link readiness.

## Frozen Copy

Success copy remains exact:

- `Build results are ready.`
- `Food batch records are ready. WIP detail was not returned.`

Recovery copy remains exact:

- `Paste the completed build result.`
- `This result does not match the selected operating mode.`
- `Ask the runner to return real NetSuite links.`
- `Use the latest completed runner result.`
- `Use available records only after import succeeds.`

## Normal Export Must Hide

- W144 endpoint
- runnerTaskId
- raw JSON
- W151 language
- semantic guard
- mode contract
- internal role arrays
- stack traces
- raw guard messages

## Preserved Boundaries

- W151 import guard
- semantic role mapping
- mode-aware naming guardrails
- dynamic record display
- consultant-facing partial result language
- operator-readable smoke packet
- frozen Review/Run wording
- import failure recovery copy
- recovery UI surface wiring
- end-to-end operator packet
- no drawer-created records
- no drawer transaction writes
- no direct SuiteScript outside approved W144 adapter path
- runner owns generated records
- image lookup disabled by default
- N/LLM advisory only

## Validation

Passed:

- `npm run harness:live-operator-export-copy-freeze-w222`
- `npm run harness:end-to-end-operator-packet-w221`
- `npm run harness:import-recovery-ui-wiring-w220`
- `npm run harness:import-failure-recovery-copy-w219`
- `npm run harness:operator-smoke-wording-freeze-w218`
- `npm run harness:mode-aware-live-review-smoke-w217`
- `npm run harness:consultant-partial-result-review-w216`
- `npm run harness:runner-output-role-mapping-w215`
- `npm run harness:operating-mode-resolver-w214`
- `npm run check`
- `npm run validate` (`PASS 1914/1914`)

## Upload Guidance

Update the Tampermonkey drawer script from `idb-drawer.user.js` if deploying W222.

Do not update:

- W144 adapter
- runner
- SuiteScript deployment
- image lookup defaults

## Visual Testing Decision

No broad visual testing was run for W222, per block scope. The change is covered by the export model and regression harnesses.

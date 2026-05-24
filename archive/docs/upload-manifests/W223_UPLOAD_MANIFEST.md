# W223 Upload Manifest - Consultant Export Button And Clipboard Packet Wiring

## Scope

W223 wires a consultant/operator-friendly copy action for the W222 operator summary. The drawer can now copy a compact operator summary without exposing internal diagnostics in normal mode. Admin/debug diagnostics remain gated behind explicit admin/debug export settings.

## Primary Update

- `idb-drawer.user.js`
  - Adds `consultantExportButtonClipboardPacketW223V1`.
  - Adds `operatorPacketForCurrentImportStatusW223V1`.
  - Adds the normal drawer button label `Copy operator summary`.
  - Adds clipboard success/failure copy:
    - `Operator summary copied.`
    - `Copy failed. Use export from admin/debug.`
  - Preserves W218 frozen success wording, W220 recovery wording, and W222 export copy.

## W223 Artifacts

- `tools/run_consultant_export_button_clipboard_packet_w223_harness.js`
- `data/w223_consultant_export_button_clipboard_packet.json`
- `trace_samples/w223_consultant_export_button_clipboard_packet_trace.json`
- `reports/w223_consultant_export_button_clipboard_packet.md`

## Normal Copy Contract

Normal copy/export includes:

- summary title
- generated timestamp
- case counts
- compact W222 case rows
- no-regression boundary summary
- visual testing decision

Normal copy/export hides:

- W144 endpoint
- runnerTaskId
- raw JSON
- W151 language
- semantic guard
- mode contract
- internal role arrays
- stack traces
- raw guard messages

## Admin/Debug Contract

Admin/debug diagnostics appendix is included only when admin/debug mode is enabled and diagnostics appendix export is explicitly requested.

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
- exportable operator summary
- no drawer-created records
- no drawer transaction writes
- no direct SuiteScript outside approved W144 adapter path
- runner owns generated records
- image lookup disabled by default
- N/LLM advisory only

## Validation

Passed:

- `npm run harness:consultant-export-button-clipboard-packet-w223`
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

Update the Tampermonkey drawer script from `idb-drawer.user.js` if deploying W223.

Do not update:

- W144 adapter
- runner
- SuiteScript deployment
- image lookup defaults

## Visual Testing Decision

No broad visual testing was run for W223, per block scope. Clipboard/export behavior is covered by the W223 harness and W222 fixture copy freeze.

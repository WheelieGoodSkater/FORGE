# W224 Upload Manifest - FORGE Header Branding And Operator Summary Surface Polish

## Scope

W224 replaces the visible drawer header text branding with the provided FORGE image asset and renames the launcher rail button from `Demo` to `FORGE`. It also polishes the W223 operator-summary copy surface with admin/debug-only diagnostics appendix control.

## Primary Update

- `idb-drawer.user.js`
  - Embeds `/path/to/downloads/FORGE.png` as the self-contained drawer header brand image.
  - Replaces visible header text `NetSuite companion` and `Intelligent Demo Builder` with the FORGE image.
  - Uses image alt text `FORGE SC Demo Creation Tool`.
  - Renames the launcher/rail button to `FORGE`.
  - Adds admin/debug-only diagnostics appendix toggle for operator summary copy/export.
  - Keeps diagnostics appendix default off.
  - Preserves W223 operator-summary copy/export behavior.

## W224 Artifacts

- `tools/run_forge_header_branding_operator_summary_surface_w224_harness.js`
- `data/w224_forge_header_branding_operator_summary_surface.json`
- `trace_samples/w224_forge_header_branding_operator_summary_surface_trace.json`
- `reports/w224_forge_header_branding_operator_summary_surface.md`

## Branding Contract

- Header uses embedded FORGE image asset.
- Header image alt text is exact: `FORGE SC Demo Creation Tool`.
- Header no longer renders visible `NetSuite companion`.
- Header no longer renders visible `Intelligent Demo Builder`.
- Launcher/rail button text is `FORGE`, not `Demo`.
- Close button remains visible and accessible.
- Header remains compact for drawer width.

## Operator Summary Contract

- Normal button label: `Copy operator summary`.
- Success feedback: `Operator summary copied.`
- Failure feedback: `Copy failed. Use export from admin/debug.`
- Admin/debug diagnostics appendix toggle is visible only in admin/debug mode.
- Diagnostics appendix remains default off.
- Normal copy/export never includes diagnostics appendix.

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
- consultant copy/export action
- no drawer-created records
- no drawer transaction writes
- no direct SuiteScript outside approved W144 adapter path
- runner owns generated records
- image lookup disabled by default
- N/LLM advisory only

## Validation

Passed:

- `npm run harness:forge-header-branding-operator-summary-surface-w224`
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

Update the Tampermonkey drawer script from `idb-drawer.user.js` if deploying W224.

Do not update:

- W144 adapter
- runner
- SuiteScript deployment
- image lookup defaults

## Visual Testing Decision

No broad visual testing was run for W224, per block scope. Branding and operator-summary surfaces are covered by W224 harness assertions.

# W225 Upload Manifest - FORGE Branding Targeted Live Header Smoke

## Scope

W225 adds a targeted live-rendered shell/header smoke for the W224 FORGE branding. It verifies the embedded FORGE logo, FORGE launcher label, close-button accessibility, and operator-summary copy surface without broad visual testing or NetSuite record-open testing.

## Primary Update

- `idb-drawer.user.js`
  - Keeps W224 FORGE header branding.
  - Updates launcher title and aria copy to use FORGE instead of the old product name.
  - Preserves W223 operator-summary copy/export surfaces.

## W225 Artifacts

- `tools/run_forge_branding_targeted_live_header_smoke_w225_harness.js`
- `data/w225_forge_branding_targeted_live_header_smoke.json`
- `trace_samples/w225_forge_branding_targeted_live_header_smoke_trace.json`
- `reports/w225_forge_branding_targeted_live_header_smoke.md`

## Live-Rendered Smoke Coverage

- Embedded FORGE logo is present in the rendered drawer header.
- Old visible header text is absent:
  - `NetSuite companion`
  - `Intelligent Demo Builder`
- Launcher/rail button text is `FORGE`.
- Launcher title and aria copy use FORGE.
- Close button remains present with `Close drawer`.
- Image alt text remains exact: `FORGE SC Demo Creation Tool`.
- `Copy operator summary` remains present near the operator import/status surface.
- Normal copy feedback remains exact:
  - `Operator summary copied.`
  - `Copy failed. Use export from admin/debug.`
- Admin/debug diagnostics appendix toggle is hidden in normal mode and visible only in admin/debug mode.

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
- FORGE branding
- no drawer-created records
- no drawer transaction writes
- no direct SuiteScript outside approved W144 adapter path
- runner owns generated records
- image lookup disabled by default
- N/LLM advisory only

## Validation

Passed:

- `npm run harness:forge-branding-targeted-live-header-smoke-w225`
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

Update the Tampermonkey drawer script from `idb-drawer.user.js` if deploying W225.

Do not update:

- W144 adapter
- runner
- SuiteScript deployment
- image lookup defaults

## Visual Testing Decision

No broad visual testing was run for W225, per block scope. W225 used a targeted live-rendered shell/header smoke only.

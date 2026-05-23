# W226 Upload Manifest - FORGE Header Responsive Logo Polish And Install Cutover Packet

## Scope

W226 increases the visible FORGE logo footprint in the drawer header while keeping it responsive to drawer width and preserving close-button space. It also adds a compact operator cutover packet for installing the FORGE-branded Tampermonkey drawer script.

## Primary Update

- `idb-drawer.user.js`
  - Updates `.idb-forge-brand` to use more of the top toolbar width.
  - Keeps responsive width constraint: `width: min(420px, calc(100% - 72px))`.
  - Reserves close-button space with `max-width: calc(100% - 72px)`.
  - Uses a cropped header-specific FORGE image, `aspect-ratio: 1370 / 515`, reserved close-button space, and `object-fit: contain` so the embedded FORGE badge remains fully visible without large source-canvas padding.
  - Preserves FORGE rail font fit correction.
  - Adds `forgeHeaderInstallCutoverPacketW226V1`.

## W226 Artifacts

- `tools/run_forge_header_install_cutover_w226_harness.js`
- `data/w226_forge_header_install_cutover_packet.json`
- `trace_samples/w226_forge_header_install_cutover_packet_trace.json`
- `reports/w226_forge_header_install_cutover_packet.md`

## Install/Update Packet

- Script to install/update: `idb-drawer.user.js`
- Install path: update Tampermonkey drawer script only.
- No W144 adapter update.
- No runner update.
- No SuiteScript deployment update.
- No image lookup change.

## Operator Cutover Confirmation

- Open a NetSuite page.
- Confirm the FORGE rail button appears.
- Confirm the FORGE rail label is not clipped.
- Open the drawer.
- Confirm the larger FORGE header logo appears.
- Narrow the window and confirm the logo scales without overlapping the close button.
- Confirm the close button works.
- Confirm `Copy operator summary` is available in the Trace/import-status surface.

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
- targeted live header smoke
- FORGE rail font fit correction
- no drawer-created records
- no drawer transaction writes
- no direct SuiteScript outside approved W144 adapter path
- runner owns generated records
- image lookup disabled by default
- N/LLM advisory only

## Validation

Passed:

- `npm run harness:forge-header-install-cutover-w226`
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

## Visual Testing Decision

No broad visual testing was run for W226, per block scope. Responsive header logo polish and cutover copy are covered by W226 harness assertions.

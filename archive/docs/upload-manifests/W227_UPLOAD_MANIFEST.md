# W227 Upload Manifest: FORGE Install Packet Final Packaging

## Scope

W227 finalizes the FORGE-branded Tampermonkey install packet and adds a compact operator install note for checking the installed drawer surface after update.

## Install Packet

Install or update this script only:

- `idb-drawer.user.js`

Included supporting artifacts:

- `W226_UPLOAD_MANIFEST.md`
- `reports/w226_forge_header_install_cutover_packet.md`
- `trace_samples/w226_forge_header_install_cutover_packet_trace.json`
- `data/w226_forge_header_install_cutover_packet.json`
- `reports/w227_forge_final_install_packet.md`
- `trace_samples/w227_forge_final_install_packet_trace.json`
- `data/w227_forge_final_install_packet.json`

## Expected Visible Change

- Header shows the larger responsive FORGE image.
- Rail button says `FORGE`.
- FORGE rail label is not clipped.
- Old visible header text is gone:
  - `NetSuite companion`
  - `Intelligent Demo Builder`
- Close button remains visible and accessible.
- `Copy operator summary` remains available in the Trace/import-status surface.

## Compact Operator Install Note

1. Update Tampermonkey drawer script only.
2. Refresh the NetSuite page.
3. Confirm the FORGE rail button appears.
4. Confirm the FORGE rail label is not clipped.
5. Open the drawer.
6. Confirm the larger FORGE header logo appears.
7. Narrow or resize the window and confirm the logo does not overlap the close button.
8. Confirm the close button works.
9. Confirm Copy operator summary appears in the Trace/import-status surface.

## Install Exclusions

- No W144 adapter update.
- No runner update.
- No SuiteScript deployment update.
- No image lookup change.

## Optional Visual Check

No broad visual testing was run in W227. A targeted operator visual check may be run after install only if desired:

- Confirm FORGE rail fit.
- Confirm larger responsive FORGE header logo.
- Confirm close-button accessibility.
- Confirm Copy operator summary placement.
- Do not test NetSuite record Open links.
- Do not invoke the runner.
- Do not invoke SuiteScript.

## Preserved Boundaries

- W151 import guard.
- Semantic role mapping.
- Mode-aware naming guardrails.
- Dynamic record display.
- Consultant-facing partial result language.
- Operator-readable smoke packet.
- Frozen Review/Run wording.
- Import failure recovery copy.
- Recovery UI surface wiring.
- End-to-end operator packet.
- Exportable operator summary.
- Consultant copy/export action.
- FORGE branding.
- Targeted live header smoke.
- FORGE rail font fit correction.
- Responsive FORGE header logo polish.
- Install/cutover packet.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM advisory only.

## Validation

- `npm run harness:forge-final-install-packet-w227`
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
- `npm run validate`


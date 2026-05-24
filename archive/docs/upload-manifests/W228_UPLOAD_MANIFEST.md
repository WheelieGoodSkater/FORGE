# W228 Upload Manifest: Post-Install FORGE Operator Acceptance Packet

## Scope

W228 adds a compact post-install acceptance packet for the FORGE-branded Tampermonkey drawer. It gives the operator a short checklist for confirming the installed drawer surface without adding broad visual testing or changing functional behavior.

## Expected Installed Script

- `idb-drawer.user.js`

## Operator Acceptance Checklist

- FORGE rail button appears.
- FORGE rail label is not clipped.
- Drawer opens.
- Larger responsive FORGE header logo appears.
- Logo scales without overlapping the close button on a narrower window.
- Close button works.
- Copy operator summary appears in the Trace/import-status surface.

## Acceptance Outcomes

- Accept: all visible checks pass.
- Accept with visual follow-up: the drawer works and the FORGE surface is usable, but minor spacing polish is desired.
- Block install: a required FORGE surface, close control, or copy-summary control is missing or unusable.

## Block Conditions

- Rail label clipped.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Normal Acceptance Note

```text
After installing the Tampermonkey drawer script, use this checklist to confirm the FORGE drawer is ready.
If every visible check passes, accept the install.
If the drawer works but spacing needs polish, accept with visual follow-up.
If a required control or FORGE brand element is missing, block the install.
```

## Install Exclusions

- No W144 adapter update.
- No runner update.
- No SuiteScript deployment update.
- No image lookup change.

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
- Final install packet.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM advisory only.

## Artifacts

- `tools/run_post_install_forge_operator_acceptance_w228_harness.js`
- `data/w228_post_install_forge_operator_acceptance_packet.json`
- `trace_samples/w228_post_install_forge_operator_acceptance_trace.json`
- `reports/w228_post_install_forge_operator_acceptance.md`

## Visual Testing Decision

No broad visual testing was run in W228. Use the post-install checklist for targeted operator acceptance only.

## Validation

- `npm run harness:post-install-forge-operator-acceptance-w228`
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


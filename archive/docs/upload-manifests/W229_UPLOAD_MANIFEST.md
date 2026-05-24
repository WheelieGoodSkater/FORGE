# W229 Upload Manifest: FORGE Post-Install Operator Evidence Intake

## Scope

W229 adds a compact evidence-intake packet for recording the operator result after installing the FORGE Tampermonkey drawer script. It classifies the result and routes only targeted follow-up work.

## Expected Installed Script

- `idb-drawer.user.js`

## Operator Evidence Fields

- Rail button visible.
- Rail label not clipped.
- Drawer opens.
- Larger FORGE header logo visible.
- Logo does not overlap close button on narrower window.
- Close button works.
- Copy operator summary visible in Trace/import-status surface.
- Optional screenshot/reference note.

## Acceptance Classification

- Accept: all required evidence fields pass and no block condition is present.
- Accept with visual follow-up: core drawer controls work, but rail label fit or responsive logo spacing needs minor polish.
- Block install: a required FORGE brand element, close control, drawer open action, or copy-summary control is missing or unusable.

## Block Conditions

- Rail label clipped.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Targeted Follow-Up Routing

- Rail label fit polish.
- Header logo sizing polish.
- Close-button accessibility fix.
- Copy-summary placement fix.
- Old-branding removal fix.

## Normal Evidence Intake Copy

```text
Record the post-install FORGE checks after updating the Tampermonkey drawer script.
Classify the result as accept, accept with visual follow-up, or block install.
Route only the specific rail, header, close-button, copy-summary, or old-branding follow-up that the evidence supports.
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
- Post-install acceptance packet.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM advisory only.

## Artifacts

- `tools/run_forge_post_install_operator_evidence_intake_w229_harness.js`
- `data/w229_forge_post_install_operator_evidence_intake_packet.json`
- `trace_samples/w229_forge_post_install_operator_evidence_intake_trace.json`
- `reports/w229_forge_post_install_operator_evidence_intake.md`

## Visual Testing Decision

No broad visual testing was run in W229. Evidence intake records targeted post-install operator observations only.

## Validation

- `npm run harness:forge-post-install-operator-evidence-intake-w229`
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


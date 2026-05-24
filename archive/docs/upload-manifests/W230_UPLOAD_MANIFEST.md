# W230 Upload Manifest: FORGE Post-Install Evidence Review And Targeted Fix Gate

## Scope

W230 adds a compact review and fix-gate packet for operator evidence captured after installing the FORGE Tampermonkey drawer script. The packet decides whether to accept, accept with visual follow-up, or block install, and it keeps any follow-up limited to the specific surface issue named by the evidence.

## Expected Installed Script

- `idb-drawer.user.js`

## Accepted Evidence Source

- W229 operator evidence intake fields.
- Optional screenshot/reference note.

## Review Outcomes

- Accept: no fix needed.
- Accept with visual follow-up: open only the targeted visual polish follow-up named by the evidence.
- Block install: open only the targeted blocked-install fix named by the evidence.

## Fix-Gate Routing

- Rail label fit polish.
- Header logo sizing polish.
- Close-button accessibility fix.
- Copy-summary placement fix.
- Old-branding removal fix.

## No-Fix Conditions

- All W229 required fields pass.
- No block condition present.
- Only optional note is supplied.

## Blocked-Install Conditions

- Rail button missing.
- Drawer does not open.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Normal Review Copy

```text
Review the post-install FORGE evidence and choose accept, accept with visual follow-up, or block install.
Open a follow-up only when the evidence names a specific rail, header, close-button, copy-summary, or old-branding issue.
If all required checks pass, no fix is needed.
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
- Post-install evidence intake packet.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM advisory only.

## Artifacts

- `tools/run_forge_post_install_evidence_review_fix_gate_w230_harness.js`
- `data/w230_forge_post_install_evidence_review_fix_gate_packet.json`
- `trace_samples/w230_forge_post_install_evidence_review_fix_gate_trace.json`
- `reports/w230_forge_post_install_evidence_review_fix_gate.md`

## Visual Testing Decision

No broad visual testing was run in W230. Review only supplied W229 evidence and route targeted follow-up if needed.

## Validation

- `npm run harness:forge-post-install-evidence-review-fix-gate-w230`
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


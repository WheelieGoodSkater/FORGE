# W231 Upload Manifest: FORGE Post-Install Acceptance Closeout Packet

## Scope

W231 adds a compact closeout packet for recording the final FORGE install disposition after W230 evidence review. It keeps any next action limited to the exact disposition and named issue.

## Expected Installed Script

- `idb-drawer.user.js`

## Accepted Evidence Source

- W230 evidence review outcome.
- W229 operator evidence intake fields.
- Optional screenshot/reference note.

## Closeout Dispositions

- Install accepted.
- Install accepted with visual follow-up.
- Install blocked.

## Closeout Next Actions

### Install Accepted

- Keep current Tampermonkey drawer script installed.
- No further action required.

### Install Accepted With Visual Follow-Up

- Keep current Tampermonkey drawer script installed.
- Open only the named visual follow-up.

### Install Blocked

- Do not treat install as accepted.
- Open only the named blocked-install fix.

## Blocked-Install Fix Categories

- Rail button missing.
- Drawer does not open.
- Header logo missing.
- Close button inaccessible.
- Old visible header text appears.
- Operator summary copy control missing.

## Visual-Follow-Up Categories

- Rail label fit polish.
- Header logo sizing polish.

## Normal Closeout Copy

```text
Record the final FORGE install disposition after reviewing the evidence.
If accepted, keep the current Tampermonkey drawer script installed.
If accepted with visual follow-up or blocked, open only the named follow-up or fix.
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
- Evidence review and targeted fix gate.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM advisory only.

## Artifacts

- `tools/run_forge_post_install_acceptance_closeout_w231_harness.js`
- `data/w231_forge_post_install_acceptance_closeout_packet.json`
- `trace_samples/w231_forge_post_install_acceptance_closeout_trace.json`
- `reports/w231_forge_post_install_acceptance_closeout.md`

## Visual Testing Decision

No broad visual testing was run in W231. Closeout records the final disposition from W230 evidence review only.

## Validation

- `npm run harness:forge-post-install-acceptance-closeout-w231`
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


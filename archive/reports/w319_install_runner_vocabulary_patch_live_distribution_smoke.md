# W319 Install Runner Vocabulary Patch And Live Distribution Smoke

## Upload Summary
Status: `operator_upload_required`

Codex prepared and validated the W318 runner vocabulary patch locally. The actual NetSuite upload and live smoke must be performed by an authenticated operator.

Upload only:
- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`

Optional installed drawer refresh:
- `idb-drawer.user.js` only if the installed drawer should also receive the smaller `Bug / Idea` button and Build-copy polish.

Do not upload or mutate:
- `src/contracts/lanePacks.js`
- proposed lane-pack fixtures
- drawer-created record logic
- new runtime dependencies

## Live Smoke Packet
Decision: `needs_attention`

Reason: the W318 patch is locally validated, but authenticated NetSuite upload/run evidence has not been captured in this Codex session.

Required live evidence fields:
- Upload timestamp
- Runner file uploaded yes/no
- W144 adapter file uploaded yes/no
- Installed drawer version/file used
- Prospect name
- Website
- Notes
- Manufacturing toggle
- WIP toggle
- Build submitted state
- Captured runnerTaskId
- Refresh/poll pending state
- Completed result state
- W151 validation result
- W214 semantic guard result
- W245 normalization result
- Finish build state
- Returned record names
- Consultant labels
- NetSuite record types
- Internal ids
- Supported Open URLs
- Open-link verification notes
- Hidden diagnostics check

## Smoke Acceptance
`ready_to_keep` requires:
- Submit succeeds through W144.
- Runner task id is captured.
- Refresh returns completed result.
- W151/W214/W245 pass.
- Finish build appears only after valid completed result.
- Returned distribution records avoid `Style`, `Formula`, `Ingredient`, `Assembly`, `Work Order`, `Routing`, and `WIP`.
- Returned labels use Product SKU / availability or replenishment language.
- Open links appear only after valid import and open supported NetSuite URLs.
- Normal consultant UI hides endpoint, raw JSON, task ids, schemas, stack traces, and admin diagnostics.

`needs_attention` applies when:
- Upload/run evidence is missing.
- Result shape is new but safe to reconcile.
- UI copy needs polish while authority boundaries hold.

`rollback_recommended` applies when:
- Bad vocabulary is imported.
- Fake or unsupported Open links appear.
- Drawer-created records or drawer transaction writes appear.
- W151/W214/W245 validation is weakened.

## Guardrails
- No drawer-created records.
- No drawer transaction writes.
- No source lane-pack mutation.
- No auto-install behavior.
- No W144 endpoint/profile behavior change beyond uploading the locally patched adapter source.
- W218/W220 wording and fake-link blocking remain preserved.

## Validation
- `npm run harness:runner-lane-vocabulary-reconciliation-w318`
- `npm run harness:install-runner-vocabulary-patch-live-distribution-smoke-w319`
- `npm run harness:connected-build-submit-refresh-import-w264`
- `npm run harness:live-adapter-smoke-retry-safety-w265`
- `npm run check`
- `npm run validate`
